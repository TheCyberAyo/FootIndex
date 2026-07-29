-- Team slugs for /team/[slug] routes (PROJECT_SPECIFICATION §83 / §70).
-- Safe to re-run on existing projects; dedupes synced duplicates (e.g. two "Norway" rows).

alter table public.teams
add column if not exists slug text;

drop index if exists public.teams_slug_idx;

-- Canonical slugs for seed UUIDs (always win over synced duplicates).
update public.teams
set slug = v.slug
from (
  values
    ('11111111-1111-4111-8111-111111111101'::uuid, 'manchester-city'),
    ('11111111-1111-4111-8111-111111111102'::uuid, 'real-madrid'),
    ('11111111-1111-4111-8111-111111111103'::uuid, 'norway'),
    ('11111111-1111-4111-8111-111111111104'::uuid, 'france'),
    ('11111111-1111-4111-8111-111111111105'::uuid, 'borussia-dortmund'),
    ('11111111-1111-4111-8111-111111111106'::uuid, 'paris-saint-germain'),
    ('11111111-1111-4111-8111-111111111107'::uuid, 'as-monaco'),
    ('11111111-1111-4111-8111-111111111108'::uuid, 'molde-fk'),
    ('11111111-1111-4111-8111-111111111109'::uuid, 'red-bull-salzburg')
) as v(id, slug)
where public.teams.id = v.id;

-- Assign slugs for any other rows, avoiding collisions with existing slugs.
do $$
declare
  team_row record;
  base_slug text;
  candidate text;
  suffix integer;
begin
  for team_row in
    select id, name
    from public.teams
    where slug is null or slug = ''
    order by created_at, id
  loop
    base_slug := trim(
      both '-'
      from regexp_replace(lower(team_row.name), '[^a-z0-9]+', '-', 'g')
    );

    if base_slug = '' then
      base_slug := 'team';
    end if;

    candidate := base_slug;
    suffix := 2;

    while exists (
      select 1
      from public.teams
      where slug = candidate
        and id <> team_row.id
    ) loop
      candidate := base_slug || '-' || suffix::text;
      suffix := suffix + 1;
    end loop;

    update public.teams
    set slug = candidate
    where id = team_row.id;
  end loop;
end $$;

-- Resolve any remaining duplicates (partial runs, manual edits, etc.).
-- Seed UUIDs keep the canonical slug; synced rows get a numeric suffix.
with ranked as (
  select
    id,
    slug,
    row_number() over (
      partition by slug
      order by
        case id
          when '11111111-1111-4111-8111-111111111101'::uuid then 1
          when '11111111-1111-4111-8111-111111111102'::uuid then 2
          when '11111111-1111-4111-8111-111111111103'::uuid then 3
          when '11111111-1111-4111-8111-111111111104'::uuid then 4
          when '11111111-1111-4111-8111-111111111105'::uuid then 5
          when '11111111-1111-4111-8111-111111111106'::uuid then 6
          when '11111111-1111-4111-8111-111111111107'::uuid then 7
          when '11111111-1111-4111-8111-111111111108'::uuid then 8
          when '11111111-1111-4111-8111-111111111109'::uuid then 9
          else 100
        end,
        created_at,
        id
    ) as slug_rank
  from public.teams
  where slug is not null
)
update public.teams as t
set slug = case
  when r.slug_rank = 1 then r.slug
  else r.slug || '-' || r.slug_rank::text
end
from ranked as r
where t.id = r.id
  and r.slug_rank > 1;

alter table public.teams
alter column slug set not null;

create unique index teams_slug_idx on public.teams (slug);
