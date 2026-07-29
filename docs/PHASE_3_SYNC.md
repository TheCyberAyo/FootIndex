# Phase 3 — API Integration

## Architecture

```
API-Football → /api/sync (CRON_SECRET) → Supabase (service role)
                                      ↓
                         RSC pages + /api/stats|/api/matches
                                      ↓
                         React Query client islands (live poll)
```

Pages **never** call API-Football directly.

## Career totals (important)

On the Free plan, sync updates **player profiles + `season_stats` + fixtures only**.

It does **not** overwrite curated `career_stats`, `trophies`, or `awards`.
Those come from `lib/data/career-baselines.ts` / `supabase/seed.sql` (club + country career).

## Prerequisites

1. Supabase migrations + seed applied
2. `.env.local` has:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `API_FOOTBALL_KEY`
   - `API_FOOTBALL_SEASON=2024` (Free plan)
   - `CRON_SECRET` (e.g. `openssl rand -hex 32`)

## Run a sync locally

```bash
curl -X POST "http://localhost:3000/api/sync?job=all" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Jobs: `players` | `fixtures` | `all`

Budget (Free 100/day): one `all` sync ≈ 2 player profile calls + 2 player-fixture calls ≈ **4 requests** (trophy sync disabled while careers are curated).

Fixture sync pulls each player’s **current club** fixtures (`/fixtures?team=…&season=…`), keeps the **5 most recent**, upserts `matches`, and inserts `player_stats` rows linked to that player. The UI only shows matches with those rows (API-Football Free has no per-player fixture filter).

## Verify

- `GET /api/health` → `apiFootballConfigured: true`, `phase: 10`
- `GET /api/stats` → season rows after players sync
- `GET /api/matches` → fixtures after fixtures sync
- Home live scores + `/stats` tables hydrate from Supabase

## Vercel Cron

Hobby accounts only allow **once-daily** cron schedules. `vercel.json` therefore runs:

- Daily 06:00 UTC → `job=all` (players + fixtures)

Set the same `CRON_SECRET` in Vercel env. Vercel sends `Authorization: Bearer <CRON_SECRET>`.

For near-live fixture refresh on Vercel, upgrade to Pro and add a sub-daily fixtures cron; until then use manual `/api/sync?job=fixtures` or rely on the daily job + client polling while a match is live.
