# Haaland vs Mbappé

Premium dark-theme football statistics site comparing **Erling Haaland** and **Kylian Mbappé** on career achievements for club and country.

Career totals are **curated baselines** (`lib/data/career-baselines.ts`) until Pro multi-season sync; Free-plan API sync updates season form and fixtures only.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Framer Motion + Recharts
- TanStack React Query
- Supabase + PostgreSQL
- API-Football

## Current status

| Phase | Status |
| --- | --- |
| 1 Foundation | Complete |
| 2 Database | Complete |
| 3 API Integration | Complete |
| 4 Player Pages | Complete |
| 5 Comparison engine | Complete |
| 6 Charts | Complete |
| 7 Voting + auth + theme | Complete |
| 8 Engagement | Complete |
| 9 SEO | Complete |
| 10 Launch polish | Complete |

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See [`docs/PHASE_3_SYNC.md`](./docs/PHASE_3_SYNC.md) to sync API-Football → Supabase.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Verify

- `GET /api/health` → `phase: 10`, `apiFootballConfigured`
- `POST /api/sync?job=all` with `Authorization: Bearer $CRON_SECRET`
- `GET /api/stats` · `GET /api/matches` · home appearances · `/compare` · `/stats`
- Legal: `/privacy` · `/terms` · `/contact` · `/api-docs`

## Project rules

- [PROJECT_RULES.md](./PROJECT_RULES.md) — coding standards

## Design system

- [styles/tokens.css](./styles/tokens.css) — semantic colours, typography, surfaces, shadows
- [styles/brand.css](./styles/brand.css) — brand accent + glass surfaces
- [lib/design-tokens.ts](./lib/design-tokens.ts) — JS mirror for charts / OG images
- Shared UI: `EmptyState`, `ErrorState`, `LoadingSkeleton`, `StatCard`, `GlassCard`
- Primary CTA: `<Button variant="brand">`

## Architecture notes

- **SEO:** Next.js Metadata API (`lib/seo.ts`)
- **API docs page:** `/api-docs` (Route Handlers live under `/api/*`)
- **Brand accent:** `--brand` (`#6CABDD`, Manchester City sky blue)
- **Data access:** UI → `services/*` → Supabase / local seed
- **External football data:** API-Football → `/api/sync` only (never from the browser)
