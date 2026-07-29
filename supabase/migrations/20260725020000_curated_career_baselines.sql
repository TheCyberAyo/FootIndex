-- Curated career baselines (Free plan): refresh totals + fix incorrect Mbappé Madrid trophies.
-- Mirrors lib/data/career-baselines.ts as of 2026-07-25.

insert into public.teams (id, name, short_name, country, team_type, api_football_id)
values (
  '11111111-1111-4111-8111-111111111109',
  'Red Bull Salzburg',
  'Salzburg',
  'Austria',
  'club',
  571
)
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  country = excluded.country,
  team_type = excluded.team_type,
  api_football_id = excluded.api_football_id;

update public.career_stats
set
  appearances = 435,
  goals = 359,
  assists = 68,
  minutes = 33500,
  club_goals = 297,
  international_goals = 62,
  champions_league_goals = 57,
  trophies_count = 12,
  awards_count = 14
where player_id = '22222222-2222-4222-8222-222222222201';

update public.career_stats
set
  appearances = 577,
  goals = 435,
  assists = 152,
  minutes = 44800,
  club_goals = 369,
  international_goals = 66,
  champions_league_goals = 70,
  trophies_count = 20,
  awards_count = 18
where player_id = '22222222-2222-4222-8222-222222222202';

-- Mbappé joined Real Madrid in summer 2024 — remove pre-arrival Madrid silverware.
delete from public.trophies
where player_id = '22222222-2222-4222-8222-222222222202'
  and team_id = '11111111-1111-4111-8111-111111111102'
  and name in ('UEFA Champions League', 'La Liga')
  and season = '2023-2024';

insert into public.trophies (player_id, team_id, name, season, year)
select *
from (
  values
    (
      '22222222-2222-4222-8222-222222222201'::uuid,
      '11111111-1111-4111-8111-111111111109'::uuid,
      'Austrian Bundesliga',
      '2018-2019',
      2019
    ),
    (
      '22222222-2222-4222-8222-222222222202'::uuid,
      '11111111-1111-4111-8111-111111111102'::uuid,
      'UEFA Super Cup',
      '2024',
      2024
    ),
    (
      '22222222-2222-4222-8222-222222222202'::uuid,
      '11111111-1111-4111-8111-111111111102'::uuid,
      'FIFA Intercontinental Cup',
      '2024',
      2024
    )
) as v(player_id, team_id, name, season, year)
where not exists (
  select 1
  from public.trophies t
  where t.player_id = v.player_id
    and t.name = v.name
    and t.season is not distinct from v.season
    and t.year = v.year
);
