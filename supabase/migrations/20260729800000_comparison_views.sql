-- Comparison view tracking (PROJECT_SPEC §105 — most viewed comparison)

create table if not exists public.comparison_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  session_id text,
  player_one_id uuid not null references public.players (id) on delete cascade,
  player_two_id uuid not null references public.players (id) on delete cascade,
  viewed_at timestamptz not null default timezone('utc', now()),
  constraint comparison_views_distinct_players check (player_one_id <> player_two_id),
  constraint comparison_views_canonical_order check (player_one_id < player_two_id)
);

create index if not exists comparison_views_user_viewed_idx
  on public.comparison_views (user_id, viewed_at desc);

create index if not exists comparison_views_session_viewed_idx
  on public.comparison_views (session_id, viewed_at desc);

create index if not exists comparison_views_players_idx
  on public.comparison_views (player_one_id, player_two_id, viewed_at desc);

alter table public.comparison_views enable row level security;

drop policy if exists "comparison_views_select_own" on public.comparison_views;
create policy "comparison_views_select_own"
on public.comparison_views for select to authenticated
using (user_id = auth.uid());

drop policy if exists "comparison_views_insert_own" on public.comparison_views;
create policy "comparison_views_insert_own"
on public.comparison_views for insert to authenticated
with check (user_id = auth.uid());

grant select, insert on public.comparison_views to authenticated;
