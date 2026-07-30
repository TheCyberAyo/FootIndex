-- Generalized head-to-head votes for any player pair (replaces haaland/mbappe-only votes).

create table if not exists public.comparison_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  player_one_id uuid not null references public.players (id) on delete cascade,
  player_two_id uuid not null references public.players (id) on delete cascade,
  choice_player_id uuid not null references public.players (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint comparison_votes_distinct_players check (player_one_id <> player_two_id),
  constraint comparison_votes_choice_valid check (
    choice_player_id = player_one_id or choice_player_id = player_two_id
  ),
  unique (user_id, player_one_id, player_two_id)
);

create trigger comparison_votes_set_updated_at
before update on public.comparison_votes
for each row execute function public.set_updated_at();

create index if not exists comparison_votes_pair_idx
  on public.comparison_votes (player_one_id, player_two_id);

alter table public.comparison_votes enable row level security;

drop policy if exists "comparison_votes_public_read" on public.comparison_votes;
create policy "comparison_votes_public_read"
on public.comparison_votes for select to anon, authenticated using (true);

drop policy if exists "comparison_votes_insert_own" on public.comparison_votes;
create policy "comparison_votes_insert_own"
on public.comparison_votes for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "comparison_votes_update_own" on public.comparison_votes;
create policy "comparison_votes_update_own"
on public.comparison_votes for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "comparison_votes_delete_own" on public.comparison_votes;
create policy "comparison_votes_delete_own"
on public.comparison_votes for delete to authenticated
using (user_id = auth.uid());

grant select on public.comparison_votes to anon, authenticated;
grant insert, update, delete on public.comparison_votes to authenticated;

-- Migrate legacy Haaland/Mbappé votes when both players exist.
insert into public.comparison_votes (user_id, player_one_id, player_two_id, choice_player_id)
select
  v.user_id,
  least(p1.id, p2.id) as player_one_id,
  greatest(p1.id, p2.id) as player_two_id,
  case
    when v.choice = 'haaland' then p1.id
    else p2.id
  end as choice_player_id
from public.votes v
cross join lateral (
  select id from public.players where slug = 'haaland' limit 1
) p1
cross join lateral (
  select id from public.players where slug = 'mbappe' limit 1
) p2
where p1.id is not null
  and p2.id is not null
  and p1.id <> p2.id
on conflict (user_id, player_one_id, player_two_id) do nothing;
