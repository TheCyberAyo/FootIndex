-- Recently viewed players (PROJECT_SPECIFICATION — navigation + future personalization)

create table if not exists public.player_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  session_id text,
  player_id uuid not null references public.players (id) on delete cascade,
  viewed_at timestamptz not null default timezone('utc', now())
);

create index if not exists player_views_user_viewed_idx
  on public.player_views (user_id, viewed_at desc);

create index if not exists player_views_session_viewed_idx
  on public.player_views (session_id, viewed_at desc);

create index if not exists player_views_player_idx
  on public.player_views (player_id);

alter table public.player_views enable row level security;

drop policy if exists "player_views_select_own" on public.player_views;
create policy "player_views_select_own"
on public.player_views for select to authenticated
using (user_id = auth.uid());

drop policy if exists "player_views_insert_own" on public.player_views;
create policy "player_views_insert_own"
on public.player_views for insert to authenticated
with check (user_id = auth.uid());

grant select, insert on public.player_views to authenticated;
