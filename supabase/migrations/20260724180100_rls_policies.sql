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
