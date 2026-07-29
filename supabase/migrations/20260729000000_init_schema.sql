-- Consolidated schema (init + RLS + policies + career baseline guard)
-- Phase 2: core schema for Haaland vs Mbappé
-- Decision: UUID primary keys for distributed-friendly IDs; api_football_id
-- nullable unique for Phase 3 upserts without coupling identity to the vendor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.team_type as enum ('club', 'national');
create type public.match_status as enum (
  'scheduled',
  'live',
  'finished',
  'postponed',
  'cancelled'
);
create type public.player_position as enum (
  'GK',
  'DF',
  'MF',
  'FW'
);
create type public.vote_choice as enum ('haaland', 'mbappe');
create type public.comment_entity_type as enum (
  'player',
  'compare',
  'news',
  'prediction'
);
create type public.like_entity_type as enum (
  'comment',
  'prediction',
  'news'
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Teams
-- ---------------------------------------------------------------------------

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  country text not null,
  team_type public.team_type not null,
  logo_url text,
  api_football_id integer unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create index teams_team_type_idx on public.teams (team_type);
create index teams_country_idx on public.teams (country);

-- ---------------------------------------------------------------------------
-- Players
-- ---------------------------------------------------------------------------

create table public.players (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text not null,
  date_of_birth date not null,
  nationality text not null,
  height_cm integer not null check (height_cm > 0),
  position public.player_position not null,
  preferred_foot text,
  bio text not null default '',
  image_url text,
  current_team_id uuid references public.teams (id) on delete set null,
  api_football_id integer unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger players_set_updated_at
before update on public.players
for each row execute function public.set_updated_at();

create index players_current_team_id_idx on public.players (current_team_id);
create index players_nationality_idx on public.players (nationality);

-- ---------------------------------------------------------------------------
-- Matches
-- ---------------------------------------------------------------------------

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  api_football_id integer unique,
  home_team_id uuid not null references public.teams (id) on delete restrict,
  away_team_id uuid not null references public.teams (id) on delete restrict,
  competition text not null,
  season text not null,
  kickoff_at timestamptz not null,
  status public.match_status not null default 'scheduled',
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  venue text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint matches_distinct_teams check (home_team_id <> away_team_id)
);

create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

create index matches_kickoff_at_idx on public.matches (kickoff_at desc);
create index matches_status_idx on public.matches (status);
create index matches_season_idx on public.matches (season);
create index matches_home_team_id_idx on public.matches (home_team_id);
create index matches_away_team_id_idx on public.matches (away_team_id);

-- ---------------------------------------------------------------------------
-- PlayerStats (per-match)
-- ---------------------------------------------------------------------------

create table public.player_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete restrict,
  minutes integer not null default 0 check (minutes >= 0),
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  shots integer not null default 0 check (shots >= 0),
  shots_on_target integer not null default 0 check (shots_on_target >= 0),
  passes integer not null default 0 check (passes >= 0),
  tackles integer not null default 0 check (tackles >= 0),
  yellow_cards integer not null default 0 check (yellow_cards >= 0),
  red_cards integer not null default 0 check (red_cards >= 0),
  rating numeric(3, 1),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (player_id, match_id)
);

create trigger player_stats_set_updated_at
before update on public.player_stats
for each row execute function public.set_updated_at();

create index player_stats_player_id_idx on public.player_stats (player_id);
create index player_stats_match_id_idx on public.player_stats (match_id);

-- ---------------------------------------------------------------------------
-- SeasonStats
-- ---------------------------------------------------------------------------

create table public.season_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  team_id uuid references public.teams (id) on delete set null,
  season text not null,
  competition text not null,
  appearances integer not null default 0 check (appearances >= 0),
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  minutes integer not null default 0 check (minutes >= 0),
  yellow_cards integer not null default 0 check (yellow_cards >= 0),
  red_cards integer not null default 0 check (red_cards >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (player_id, season, competition)
);

create trigger season_stats_set_updated_at
before update on public.season_stats
for each row execute function public.set_updated_at();

create index season_stats_player_id_idx on public.season_stats (player_id);
create index season_stats_season_idx on public.season_stats (season);

-- ---------------------------------------------------------------------------
-- CareerStats
-- ---------------------------------------------------------------------------

create table public.career_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null unique references public.players (id) on delete cascade,
  appearances integer not null default 0 check (appearances >= 0),
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  minutes integer not null default 0 check (minutes >= 0),
  club_goals integer not null default 0 check (club_goals >= 0),
  international_goals integer not null default 0 check (international_goals >= 0),
  champions_league_goals integer not null default 0 check (champions_league_goals >= 0),
  trophies_count integer not null default 0 check (trophies_count >= 0),
  awards_count integer not null default 0 check (awards_count >= 0),
  goals_per_game numeric(5, 3) generated always as (
    case
      when appearances = 0 then 0
      else round(goals::numeric / appearances::numeric, 3)
    end
  ) stored,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger career_stats_set_updated_at
before update on public.career_stats
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Awards
-- ---------------------------------------------------------------------------

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  name text not null,
  season text,
  year integer not null check (year >= 1900),
  competition text,
  created_at timestamptz not null default timezone('utc', now())
);

create index awards_player_id_idx on public.awards (player_id);
create index awards_year_idx on public.awards (year desc);

-- ---------------------------------------------------------------------------
-- Trophies
-- ---------------------------------------------------------------------------

create table public.trophies (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  team_id uuid references public.teams (id) on delete set null,
  name text not null,
  season text,
  year integer not null check (year >= 1900),
  created_at timestamptz not null default timezone('utc', now())
);

create index trophies_player_id_idx on public.trophies (player_id);
create index trophies_year_idx on public.trophies (year desc);

-- ---------------------------------------------------------------------------
-- Users (app profile linked to auth.users)
-- ---------------------------------------------------------------------------

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Fan'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Votes (one vote per user — who is better)
-- ---------------------------------------------------------------------------

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  choice public.vote_choice not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id)
);

create trigger votes_set_updated_at
before update on public.votes
for each row execute function public.set_updated_at();

create index votes_choice_idx on public.votes (choice);

-- ---------------------------------------------------------------------------
-- Predictions
-- ---------------------------------------------------------------------------

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  predicted_home_score integer not null check (predicted_home_score >= 0),
  predicted_away_score integer not null check (predicted_away_score >= 0),
  predicted_scorer_player_id uuid references public.players (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, match_id)
);

create trigger predictions_set_updated_at
before update on public.predictions
for each row execute function public.set_updated_at();

create index predictions_match_id_idx on public.predictions (match_id);
create index predictions_user_id_idx on public.predictions (user_id);

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  entity_type public.comment_entity_type not null,
  entity_id text not null,
  parent_id uuid references public.comments (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create index comments_entity_idx on public.comments (entity_type, entity_id);
create index comments_user_id_idx on public.comments (user_id);
create index comments_parent_id_idx on public.comments (parent_id);

-- ---------------------------------------------------------------------------
-- Likes (polymorphic)
-- ---------------------------------------------------------------------------

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  entity_type public.like_entity_type not null,
  entity_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, entity_type, entity_id)
);

create index likes_entity_idx on public.likes (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Vote leaderboard view (public aggregates)
-- ---------------------------------------------------------------------------

create or replace view public.vote_leaderboard
with (security_invoker = true)
as
select
  choice,
  count(*)::integer as vote_count,
  round(
    100.0 * count(*)::numeric / nullif(sum(count(*)) over (), 0),
    1
  ) as vote_percentage
from public.votes
group by choice;

-- Phase 2: Row Level Security
-- Decision: public read for all stats tables; authenticated write for
-- engagement tables; service role bypasses RLS for Phase 3 sync jobs.

alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.player_stats enable row level security;
alter table public.season_stats enable row level security;
alter table public.career_stats enable row level security;
alter table public.awards enable row level security;
alter table public.trophies enable row level security;
alter table public.users enable row level security;
alter table public.votes enable row level security;
alter table public.predictions enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- ---------------------------------------------------------------------------
-- Public read: reference + stats data
-- ---------------------------------------------------------------------------

create policy "teams_public_read"
on public.teams for select
to anon, authenticated
using (true);

create policy "players_public_read"
on public.players for select
to anon, authenticated
using (true);

create policy "matches_public_read"
on public.matches for select
to anon, authenticated
using (true);

create policy "player_stats_public_read"
on public.player_stats for select
to anon, authenticated
using (true);

create policy "season_stats_public_read"
on public.season_stats for select
to anon, authenticated
using (true);

create policy "career_stats_public_read"
on public.career_stats for select
to anon, authenticated
using (true);

create policy "awards_public_read"
on public.awards for select
to anon, authenticated
using (true);

create policy "trophies_public_read"
on public.trophies for select
to anon, authenticated
using (true);

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

create policy "users_public_read"
on public.users for select
to anon, authenticated
using (true);

create policy "users_update_own"
on public.users for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Inserts happen via security definer trigger on auth.users

-- ---------------------------------------------------------------------------
-- Votes: everyone can read tallies; one row per user upserted by owner
-- ---------------------------------------------------------------------------

create policy "votes_public_read"
on public.votes for select
to anon, authenticated
using (true);

create policy "votes_insert_own"
on public.votes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "votes_update_own"
on public.votes for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "votes_delete_own"
on public.votes for delete
to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Predictions
-- ---------------------------------------------------------------------------

create policy "predictions_public_read"
on public.predictions for select
to anon, authenticated
using (true);

create policy "predictions_insert_own"
on public.predictions for insert
to authenticated
with check (auth.uid() = user_id);

create policy "predictions_update_own"
on public.predictions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "predictions_delete_own"
on public.predictions for delete
to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------

create policy "comments_public_read"
on public.comments for select
to anon, authenticated
using (true);

create policy "comments_insert_own"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "comments_update_own"
on public.comments for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "comments_delete_own"
on public.comments for delete
to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Likes
-- ---------------------------------------------------------------------------

create policy "likes_public_read"
on public.likes for select
to anon, authenticated
using (true);

create policy "likes_insert_own"
on public.likes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "likes_delete_own"
on public.likes for delete
to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Grants for anon/authenticated (RLS still applies)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to anon, authenticated;
grant select on public.vote_leaderboard to anon, authenticated;

grant insert, update, delete on public.votes to authenticated;
grant insert, update, delete on public.predictions to authenticated;
grant insert, update, delete on public.comments to authenticated;
grant insert, delete on public.likes to authenticated;
grant update on public.users to authenticated;

-- Phase 7: allow authenticated users to self-heal missing profile rows
-- (trigger on auth.users remains primary path).

create policy "users_insert_own"
on public.users for insert
to authenticated
with check (auth.uid() = id);

grant insert on public.users to authenticated;

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
