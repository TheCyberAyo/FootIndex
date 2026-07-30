-- Data model pipeline: countries, competitions, seasons, transfers,
-- comparison_cache, search_history + season_stats FK backfill.
-- Idempotent — safe to re-run after a partial apply.

do $do$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'competition_type'
      and n.nspname = 'public'
  ) then
    create type public.competition_type as enum (
      'league',
      'cup',
      'international',
      'other'
    );
  end if;
end
$do$;

-- ---------------------------------------------------------------------------
-- Countries
-- ---------------------------------------------------------------------------

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text,
  flag_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists countries_set_updated_at on public.countries;
create trigger countries_set_updated_at
before update on public.countries
for each row execute function public.set_updated_at();

create index if not exists countries_code_idx on public.countries (code);

-- ---------------------------------------------------------------------------
-- Competitions
-- ---------------------------------------------------------------------------

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  api_football_id integer unique,
  country_id uuid references public.countries (id) on delete set null,
  logo_url text,
  competition_type public.competition_type not null default 'other',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists competitions_set_updated_at on public.competitions;
create trigger competitions_set_updated_at
before update on public.competitions
for each row execute function public.set_updated_at();

create index if not exists competitions_country_id_idx on public.competitions (country_id);
create index if not exists competitions_name_idx on public.competitions (name);

-- ---------------------------------------------------------------------------
-- Seasons
-- ---------------------------------------------------------------------------

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  year integer not null check (year >= 1900 and year <= 2100),
  label text not null unique,
  start_date date,
  end_date date,
  active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists seasons_set_updated_at on public.seasons;
create trigger seasons_set_updated_at
before update on public.seasons
for each row execute function public.set_updated_at();

create index if not exists seasons_year_idx on public.seasons (year desc);

-- ---------------------------------------------------------------------------
-- season_stats FK columns (keep text columns for backward compatibility)
-- ---------------------------------------------------------------------------

alter table public.season_stats
  add column if not exists competition_id uuid references public.competitions (id) on delete set null,
  add column if not exists season_id uuid references public.seasons (id) on delete set null;

create index if not exists season_stats_competition_id_idx
  on public.season_stats (competition_id);

create index if not exists season_stats_season_id_idx
  on public.season_stats (season_id);

-- ---------------------------------------------------------------------------
-- Transfers
-- ---------------------------------------------------------------------------

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  from_team_id uuid references public.teams (id) on delete set null,
  to_team_id uuid references public.teams (id) on delete set null,
  transfer_date date not null,
  transfer_type text,
  fee_text text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (player_id, transfer_date, to_team_id)
);

drop trigger if exists transfers_set_updated_at on public.transfers;
create trigger transfers_set_updated_at
before update on public.transfers
for each row execute function public.set_updated_at();

create index if not exists transfers_player_id_idx on public.transfers (player_id);
create index if not exists transfers_transfer_date_idx on public.transfers (transfer_date desc);

-- ---------------------------------------------------------------------------
-- Comparison cache
-- ---------------------------------------------------------------------------

create table if not exists public.comparison_cache (
  id uuid primary key default gen_random_uuid(),
  player_one_id uuid not null references public.players (id) on delete cascade,
  player_two_id uuid not null references public.players (id) on delete cascade,
  season_filter text not null default '',
  comparison_json jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint comparison_cache_distinct_players check (player_one_id <> player_two_id),
  unique (player_one_id, player_two_id, season_filter)
);

drop trigger if exists comparison_cache_set_updated_at on public.comparison_cache;
create trigger comparison_cache_set_updated_at
before update on public.comparison_cache
for each row execute function public.set_updated_at();

create index if not exists comparison_cache_players_idx
  on public.comparison_cache (player_one_id, player_two_id);

-- ---------------------------------------------------------------------------
-- Search history
-- ---------------------------------------------------------------------------

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  session_id text,
  search_term text not null check (char_length(trim(search_term)) >= 2),
  player_id uuid references public.players (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists search_history_user_created_idx
  on public.search_history (user_id, created_at desc);

create index if not exists search_history_session_created_idx
  on public.search_history (session_id, created_at desc);

create index if not exists search_history_term_idx on public.search_history (search_term);

-- ---------------------------------------------------------------------------
-- Backfill reference data from existing rows
-- ---------------------------------------------------------------------------

insert into public.countries (name)
select distinct nationality
from public.players
where nationality is not null and trim(nationality) <> ''
on conflict (name) do nothing;

insert into public.countries (name)
select distinct country
from public.teams
where country is not null and trim(country) <> ''
on conflict (name) do nothing;

insert into public.competitions (slug, name)
select distinct
  trim(both '-' from regexp_replace(lower(competition), '[^a-z0-9]+', '-', 'g')) as slug,
  competition as name
from public.season_stats
where competition is not null and trim(competition) <> ''
on conflict (slug) do nothing;

insert into public.seasons (year, label, active)
select distinct
  coalesce(
    nullif(substring(season from '^(\d{4})'), '')::integer,
    2024
  ) as year,
  season as label,
  false
from public.season_stats
where season is not null and trim(season) <> ''
on conflict (label) do nothing;

update public.season_stats ss
set competition_id = c.id
from public.competitions c
where ss.competition_id is null
  and c.name = ss.competition;

update public.season_stats ss
set season_id = s.id
from public.seasons s
where ss.season_id is null
  and s.label = ss.season;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.countries enable row level security;
alter table public.competitions enable row level security;
alter table public.seasons enable row level security;
alter table public.transfers enable row level security;
alter table public.comparison_cache enable row level security;
alter table public.search_history enable row level security;

drop policy if exists "countries_public_read" on public.countries;
create policy "countries_public_read"
on public.countries for select to anon, authenticated using (true);

drop policy if exists "competitions_public_read" on public.competitions;
create policy "competitions_public_read"
on public.competitions for select to anon, authenticated using (true);

drop policy if exists "seasons_public_read" on public.seasons;
create policy "seasons_public_read"
on public.seasons for select to anon, authenticated using (true);

drop policy if exists "transfers_public_read" on public.transfers;
create policy "transfers_public_read"
on public.transfers for select to anon, authenticated using (true);

drop policy if exists "comparison_cache_public_read" on public.comparison_cache;
create policy "comparison_cache_public_read"
on public.comparison_cache for select to anon, authenticated using (true);

drop policy if exists "search_history_select_own" on public.search_history;
create policy "search_history_select_own"
on public.search_history for select to authenticated
using (user_id = auth.uid());

drop policy if exists "search_history_insert_own" on public.search_history;
create policy "search_history_insert_own"
on public.search_history for insert to authenticated
with check (user_id = auth.uid());

grant select on public.countries to anon, authenticated;
grant select on public.competitions to anon, authenticated;
grant select on public.seasons to anon, authenticated;
grant select on public.transfers to anon, authenticated;
grant select on public.comparison_cache to anon, authenticated;
grant select, insert on public.search_history to authenticated;
