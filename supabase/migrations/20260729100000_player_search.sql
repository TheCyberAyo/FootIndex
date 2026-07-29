-- Player full-text search (PROJECT_SPECIFICATION §43)
-- Decision: generated tsvector on player fields; club/competition resolved at query time.

alter table public.players
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector(
      'english',
      coalesce(name, '') || ' ' ||
      coalesce(short_name, '') || ' ' ||
      coalesce(nationality, '') || ' ' ||
      coalesce(slug, '')
    )
  ) stored;

create index if not exists players_search_vector_idx
  on public.players using gin (search_vector);

create or replace function public.search_players(
  search_query text,
  result_limit integer default 8
)
returns table (
  id uuid,
  slug text,
  name text,
  short_name text,
  date_of_birth date,
  nationality text,
  player_position public.player_position,
  image_url text,
  club_name text,
  club_logo_url text,
  competition text,
  search_rank real
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  normalized text := trim(search_query);
  ts_query tsquery;
begin
  if length(normalized) < 2 then
    return;
  end if;

  ts_query := websearch_to_tsquery('english', normalized);

  return query
  select
    p.id,
    p.slug,
    p.name,
    p.short_name,
    p.date_of_birth,
    p.nationality,
    p.position as player_position,
    p.image_url,
    t.name as club_name,
    t.logo_url as club_logo_url,
    (
      select ss.competition
      from public.season_stats ss
      where ss.player_id = p.id
      order by ss.season desc
      limit 1
    ) as competition,
    ts_rank(p.search_vector, ts_query)::real as search_rank
  from public.players p
  left join public.teams t on t.id = p.current_team_id
  where
    p.search_vector @@ ts_query
    or p.name ilike '%' || normalized || '%'
    or p.short_name ilike '%' || normalized || '%'
    or p.nationality ilike '%' || normalized || '%'
    or p.slug ilike '%' || normalized || '%'
    or coalesce(t.name, '') ilike '%' || normalized || '%'
  order by search_rank desc nulls last, p.name asc
  limit greatest(1, least(result_limit, 25));
end;
$$;

grant execute on function public.search_players(text, integer) to anon, authenticated;
