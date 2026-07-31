-- Saved players, teams, and comparisons (PROJECT_SPEC §159)

create type public.favorite_entity_type as enum ('player', 'team', 'comparison');

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  entity_type public.favorite_entity_type not null,
  player_id uuid references public.players (id) on delete cascade,
  team_id uuid references public.teams (id) on delete cascade,
  player_one_id uuid references public.players (id) on delete cascade,
  player_two_id uuid references public.players (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint user_favorites_player_required
    check (entity_type <> 'player' or player_id is not null),
  constraint user_favorites_team_required
    check (entity_type <> 'team' or team_id is not null),
  constraint user_favorites_comparison_required
    check (
      entity_type <> 'comparison'
      or (player_one_id is not null and player_two_id is not null and player_one_id < player_two_id)
    )
);

create unique index if not exists user_favorites_player_unique
  on public.user_favorites (user_id, player_id)
  where entity_type = 'player';

create unique index if not exists user_favorites_team_unique
  on public.user_favorites (user_id, team_id)
  where entity_type = 'team';

create unique index if not exists user_favorites_comparison_unique
  on public.user_favorites (user_id, player_one_id, player_two_id)
  where entity_type = 'comparison';

create index if not exists user_favorites_user_created_idx
  on public.user_favorites (user_id, created_at desc);

alter table public.user_favorites enable row level security;

drop policy if exists "user_favorites_select_own" on public.user_favorites;
create policy "user_favorites_select_own"
on public.user_favorites for select to authenticated
using (user_id = auth.uid());

drop policy if exists "user_favorites_insert_own" on public.user_favorites;
create policy "user_favorites_insert_own"
on public.user_favorites for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_favorites_delete_own" on public.user_favorites;
create policy "user_favorites_delete_own"
on public.user_favorites for delete to authenticated
using (user_id = auth.uid());

grant select, insert, delete on public.user_favorites to authenticated;
