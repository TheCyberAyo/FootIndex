import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import {
  createBreadcrumbJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/json-ld";

export const metadata = createPageMetadata({
  title: "API",
  description: `API documentation for ${SITE_NAME} — health, sync, players, stats, matches, votes, predictions, comments, and likes.`,
  path: "/api-docs",
});

interface ApiEndpoint {
  method: string;
  path: string;
  auth: string;
  description: string;
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/health",
    auth: "None",
    description:
      "Service health, phase, Supabase/API-Football flags, and sync hints.",
  },
  {
    method: "GET | POST",
    path: "/api/sync?job=players|fixtures|all",
    auth: "Bearer CRON_SECRET",
    description:
      "Server-only API-Football → Supabase sync for every player with api_football_id (profiles/seasons or club fixtures).",
  },
  {
    method: "GET",
    path: "/api/players",
    auth: "None",
    description: "Haaland and Mbappé identity + career summary fields.",
  },
  {
    method: "GET",
    path: "/api/search?q=&limit=",
    auth: "None",
    description:
      "Player search autocomplete — Supabase full-text search (min 2 chars, never Football API).",
  },
  {
    method: "GET",
    path: "/api/stats",
    auth: "None",
    description: "Career + season stats for both players.",
  },
  {
    method: "GET",
    path: "/api/matches",
    auth: "None",
    description:
      "Recent player appearances (up to 5 each) and live-score cards.",
  },
  {
    method: "GET",
    path: "/api/votes",
    auth: "None (public tallies)",
    description: "Community vote tallies; signed-in users also see their vote.",
  },
  {
    method: "POST",
    path: "/api/votes",
    auth: "Session cookie",
    description: "Body `{ choice: 'haaland' | 'mbappe' }` — upsert one vote.",
  },
  {
    method: "GET",
    path: "/api/predictions",
    auth: "None (summaries)",
    description: "Upcoming match prediction summaries.",
  },
  {
    method: "POST",
    path: "/api/predictions",
    auth: "Session cookie",
    description: "Upsert scoreline + optional first-scorer prediction.",
  },
  {
    method: "GET",
    path: "/api/comments?entityType=&entityId=",
    auth: "None",
    description:
      "List comments for player | compare | news | prediction entities.",
  },
  {
    method: "POST",
    path: "/api/comments",
    auth: "Session cookie",
    description: "Create a comment (`entityType`, `entityId`, `body`).",
  },
  {
    method: "DELETE",
    path: "/api/comments",
    auth: "Session cookie",
    description: "Delete your own comment.",
  },
  {
    method: "POST",
    path: "/api/likes",
    auth: "Session cookie",
    description: "Toggle like on a comment (`commentId` UUID).",
  },
];

/**
 * Decision: route is /api-docs (not /api) so App Router /api/* stays for handlers.
 */
export default function ApiDocsPage() {
  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "API documentation",
            description: `HTTP API routes for ${SITE_NAME}.`,
            path: "/api-docs",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "API", path: "/api-docs" },
          ]),
        ]}
      />
      <PageHeader
        eyebrow="Developers"
        title="API"
        description="JSON Route Handlers under /api/*. Pages never call API-Football from the browser — only /api/sync does, with CRON_SECRET."
      />
      <Section
        title="Endpoints"
        description="Auth session routes use Supabase cookies from magic link or Google sign-in."
      >
        <ul className="grid gap-3">
          {ENDPOINTS.map((endpoint) => (
            <GlassCard
              key={`${endpoint.method}-${endpoint.path}`}
              className="p-5"
              as="li"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <code className="rounded bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand">
                  {endpoint.method}
                </code>
                <code className="text-sm text-white">{endpoint.path}</code>
              </div>
              <p className="mt-2 text-xs text-white/40">Auth: {endpoint.auth}</p>
              <p className="mt-2 text-sm text-white/65">{endpoint.description}</p>
            </GlassCard>
          ))}
        </ul>
      </Section>
    </>
  );
}
