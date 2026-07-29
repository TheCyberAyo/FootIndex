# Supabase setup (Phase 2)

## What lives here

| Path | Purpose |
| --- | --- |
| `migrations/20260724180000_init_schema.sql` | Tables, indexes, triggers, vote leaderboard view |
| `migrations/20260724180100_rls_policies.sql` | Row Level Security + grants |
| `seed.sql` | Haaland / Mbappé teams, players, curated career baselines, sample matches |
| `migrations/20260725020000_curated_career_baselines.sql` | Refresh career totals + fix bad trophy rows on existing DBs |

## Apply in Supabase Dashboard

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**.
3. Run `migrations/20260724180000_init_schema.sql`.
4. Run `migrations/20260724180100_rls_policies.sql`.
5. Run `seed.sql`.
6. Copy Project URL + anon key + service role key into `.env.local`.

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Apply with Supabase CLI (optional)

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
npx supabase db query -f supabase/seed.sql
```

## Local fallback

If env vars are missing, services use `lib/data/local-seed.ts` (same IDs as SQL).
The home page and `/api/health` show `dataSource: "local-seed" | "supabase"`.

## Schema overview

`teams` → `players` → `career_stats` / `season_stats` / `awards` / `trophies`  
`matches` → `player_stats`  
`auth.users` → `users` → `votes` / `predictions` / `comments` / `likes`
