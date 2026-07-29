import { SITE_URL } from "@/lib/constants";
import { CURATED_NEWS } from "@/lib/data/news";

export interface SitemapEntry {
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}

/**
 * Canonical public routes for sitemap (excludes /login, /auth, /api).
 * Prefer short player URLs over /players/[slug] duplicates.
 */
export function listPublicSitemapEntries(): SitemapEntry[] {
  const staticRoutes: SitemapEntry[] = [
    { path: "/", changeFrequency: "hourly", priority: 1 },
    { path: "/haaland", changeFrequency: "daily", priority: 0.95 },
    { path: "/mbappe", changeFrequency: "daily", priority: 0.95 },
    { path: "/compare", changeFrequency: "hourly", priority: 0.9 },
    { path: "/predict", changeFrequency: "hourly", priority: 0.8 },
    { path: "/stats", changeFrequency: "daily", priority: 0.85 },
    { path: "/news", changeFrequency: "daily", priority: 0.75 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
    { path: "/api-docs", changeFrequency: "monthly", priority: 0.4 },
  ];

  const newsRoutes: SitemapEntry[] = CURATED_NEWS.map((article) => ({
    path: `/news/${article.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  return [...staticRoutes, ...newsRoutes];
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, "")}${normalized}`;
}
