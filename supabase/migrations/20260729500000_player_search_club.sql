-- Index club names in player FTS (PROJECT_SPECIFICATION §43)
-- Decision: denormalize current_club_name on players; generated search_vector cannot join teams.

alter table public.players
  add column if not exists current_club_name text;

update public.players p
set current_club_name = t.name
from public.teams t
where t.id = p.current_team_id
  and p.current_club_name is distinct from t.name;

create or replace function public.set_player_current_club_name()
returns trigger
language plpgsql
as $$
begin
  if NEW.current_team_id is null then
    NEW.current_club_name := null;
  else
    select t.name into NEW.current_club_name
    from public.teams t
    where t.id = NEW.current_team_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists players_set_club_name on public.players;
create trigger players_set_club_name
before insert or update of current_team_id on public.players
for each row
execute function public.set_player_current_club_name();

create or replace function public.propagate_team_name_to_players()
returns trigger
language plpgsql
as $$
begin
  if NEW.name is distinct from OLD.name then
    update public.players
    set current_club_name = NEW.name
    where current_team_id = NEW.id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists teams_propagate_name on public.teams;
create trigger teams_propagate_name
after update of name on public.teams
for each row
execute function public.propagate_team_name_to_players();

drop index if exists public.players_search_vector_idx;

alter table public.players
  drop column if exists search_vector;

alter table public.players
  add column search_vector tsvector
  generated always as (
    to_tsvector(
      'english',
      coalesce(name, '') || ' ' ||
      coalesce(short_name, '') || ' ' ||
      coalesce(nationality, '') || ' ' ||
      coalesce(slug, '') || ' ' ||
      coalesce(current_club_name, '')
    )
  ) stored;

create index if not exists players_search_vector_idx
  on public.players using gin (search_vector);
