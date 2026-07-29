-- Phase 7: allow authenticated users to self-heal missing profile rows
-- (trigger on auth.users remains primary path).

create policy "users_insert_own"
on public.users for insert
to authenticated
with check (auth.uid() = id);

grant insert on public.users to authenticated;
