# Product Decisions

Approved: 2026-07-24  
Updated: 2026-07-25 (Phase 10 launch polish)  
Status: Phases 1–10 complete for v1 (change only deliberately)

---

## Product north star

Compare **Erling Haaland** and **Kylian Mbappé** on **career achievements for club (teams) and country** — goals, trophies, awards, and competition splits. Live scores, votes, and predictions are secondary engagement around that spine.

---

## Career data (Free plan)

| Decision | Choice |
| --- | --- |
| Career totals source | **Curated baselines** in `lib/data/career-baselines.ts` (+ `supabase/seed.sql`) |
| Scope | Senior first-team club + senior international (exclude reserve/B teams) |
| Club vs country | `club_goals` / `international_goals` / `champions_league_goals` on `career_stats` |
| Free-plan sync | Updates **player profile + `season_stats` + fixtures only** |
| Sync must not | Overwrite `career_stats`, or delete/replace curated `trophies` / `awards` |
| Assists / minutes | Curated estimates until multi-season API history exists |
| Pro upgrade path | Multi-season historical sync may later refresh or replace baselines |

Baseline as-of date and sources are documented in `career-baselines.ts`.

---

## Year / season compare

| Decision | Choice |
| --- | --- |
| Location | `/compare#by-year` |
| Club unit | Football **season** rows in `lib/data/season-baselines.ts` |
| Country unit | Calendar **year** international goals (`INTERNATIONAL_BY_YEAR`) |
| Search | Query matches year (`2023`), season (`2022-2023`), or club name |
| Shareable URL | `?season=2022-2023` and/or `?year=2023` |
| Missing side | Show “No senior club season”; do not invent zeros as activity |

---

## Data provider

| Decision | Choice |
| --- | --- |
| Football API | **API-Football** (`v3.football.api-sports.io`) |
| Player IDs (verified) | Haaland **1100**, Mbappé **278** |
| Team IDs | Man City **50**, Real Madrid **541** |
| Free-plan seasons | **2022–2024** only (use **2024** as sync target until Pro) |
| Season env override | `API_FOOTBALL_SEASON` (default `2024`) |
| Upgrade path | Pro (~$19/mo) before public launch / current-season live sync |

---

## Auth (Phases 7–8)

| Decision | Choice |
| --- | --- |
| Provider | **Supabase Auth** |
| Methods | **Email magic link + Google** |
| Deferred | GitHub OAuth (optional later) |

Used for: voting, predictions, comments, likes.

---

## Sync cadence (Phase 3+)

| Job | Cadence | Notes |
| --- | --- | --- |
| Player + season stats | **Daily** with fixtures | Profile + season rows only (not career rollup) |
| Fixtures / scores | **Daily** (Hobby) | Last **5** club fixtures per player → `matches` + `player_stats` |
| Vercel Cron | **Once daily** `0 6 * * *` → `job=all` | Hobby forbids sub-daily schedules; Pro can restore frequent fixture cron |
| Live match refresh | Client poll while `live` | React Query on `/api/matches` (not Vercel Cron) |
| On-demand | Manual `/api/sync` (protected) | Dev + admin recovery |

Pages read from **Supabase**, not API-Football directly.

---

## News

| Decision | Choice |
| --- | --- |
| Phase 8 | **Curated** articles in `lib/data/news.ts` (fixed UUIDs for comments) |
| Later | Revisit CMS or third-party news source |

API-Football is not used as a news feed.

---

## Engagement (Phase 8)

| Decision | Choice |
| --- | --- |
| Predictions | Scoreline + first scorer (Haaland/Mbappé); upsert per user/match |
| Comments | On player, compare, news, prediction board; auth required to write |
| Likes | Toggle on **comments** (UUID targets) |
| Stats hub | Efficiency cards + charts + season tables on `/stats` |

---

## SEO (Phase 9)

| Decision | Choice |
| --- | --- |
| Metadata | Native App Router Metadata API (`lib/seo.ts`) |
| Titles | Root template `%s \| SITE_NAME`; home uses absolute brand title |
| Social images | `app/opengraph-image.tsx` + `twitter-image.tsx` (1200×630) |
| Crawl | `app/sitemap.ts` + `app/robots.ts` (disallow `/api`, `/login`, `/auth`) |
| JSON-LD | WebSite, WebPage, BreadcrumbList, FAQPage, NewsArticle, Person/Athlete |
| Fonts | Syne + DM Sans, `latin` subset, `display: swap` (CWV) |

---

## Launch polish (Phase 10)

| Decision | Choice |
| --- | --- |
| Privacy / Terms | Real product copy on `/privacy` and `/terms` (v1; not counsel-reviewed) |
| Contact | Mailto topics on `/contact` via `NEXT_PUBLIC_CONTACT_EMAIL` |
| API docs | Live route catalogue on `/api-docs` |
| Health | `GET /api/health` reports `phase: 10` |
| Player videos | Placeholder retained — “highlights coming later” (no embeds in v1) |

Deploy, custom domain, and Google Search Console remain ops steps outside this phase.

---

## Out of scope for v1 data

- xG / Opta-grade analytics
- Perfect award encyclopedias (Ballon d’Or etc. may stay manual/seeded)
- Scraping Transfermarkt or unofficial sources

---

## Comparison engine (Phase 5)

| Decision | Choice |
| --- | --- |
| Layout | Haaland **left**, Mbappé **right** (mobile: stacked values under each metric) |
| Winner rule | Higher numeric value wins; equal → tie |
| Highlight | Brand City blue (`#6CABDD`) on leader value + bar |
| Engine | Pure `lib/compare` (no I/O) — shared by `/compare` + home preview |
| Charts | **Phase 6** — Recharts on home, player, compare |
| Vote CTA | Live `#vote` on home + compare (Phase 7) |

---

## Voting (Phase 7)

| Decision | Choice |
| --- | --- |
| Auth | Supabase magic link + Google → `/auth/callback` |
| Persistence | `votes` upsert on `user_id` (one vote, changeable) |
| API | `GET/POST /api/votes` |
| Leaderboard | `vote_leaderboard` view + 30s client poll |
| Theme | `next-themes`, default **dark**, optional light toggle |
| ISR | Server loads public tallies only; auth vote hydrates client-side |

---

## Charts (Phase 6)

| Decision | Choice |
| --- | --- |
| Library | **Recharts** (client islands + mount gate / skeleton) |
| Colors | Haaland **white**, Mbappé **brand yellow**; pie club=yellow / intl=white |
| Radar | Relative 0–100 per metric (max of the pair = 100) |
| Bar | Absolute career totals |
| Pie | Club vs international goals |
| Line | Season goals (dual on compare; goals+assists on player) |
| CLS | Fixed-height `ChartShell` reserves space before mount |
