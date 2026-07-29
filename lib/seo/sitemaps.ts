import { comparePath, defaultComparePath } from "@/lib/compare/paths";
import { competitionPath } from "@/lib/competitions/paths";
import { CURATED_NEWS } from "@/lib/data/news";
import { playerPath } from "@/lib/players/paths";
import { RANKING_CATEGORIES } from "@/lib/rankings/categories";
import { teamPath } from "@/lib/teams/paths";
import { listCompetitions } from "@/services/competitions/competitions.service";
import { listPlayers, listTeams } from "@/services";

import type { SitemapEntry } from "@/lib/seo/routes";

export function listStaticSitemapEntries(): SitemapEntry[] {
  return [
    { path: "/", changeFrequency: "hourly", priority: 1 },
    { path: "/search", changeFrequency: "daily", priority: 0.9 },
    { path: "/rankings", changeFrequency: "daily", priority: 0.85 },
    { path: "/competition", changeFrequency: "daily", priority: 0.8 },
    { path: defaultComparePath(), changeFrequency: "hourly", priority: 0.9 },
    { path: "/predict", changeFrequency: "hourly", priority: 0.8 },
    { path: "/stats", changeFrequency: "daily", priority: 0.85 },
    { path: "/news", changeFrequency: "daily", priority: 0.75 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
    { path: "/api-docs", changeFrequency: "monthly", priority: 0.4 },
  ];
}

export async function listPlayerSitemapEntries(): Promise<SitemapEntry[]> {
  const players = await listPlayers();
  return players.map((player) => ({
    path: playerPath(player.slug),
    changeFrequency: "daily" as const,
    priority: 0.95,
  }));
}

/**
 * One canonical compare URL per unordered pair (lexicographic slug order).
 * PROJECT_SPECIFICATION §87 — Comparison Sitemap.
 */
export async function listCompareSitemapEntries(): Promise<SitemapEntry[]> {
  const players = await listPlayers();
  const entries: SitemapEntry[] = [];

  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      const [playerOne, playerTwo] = [players[i].slug, players[j].slug].sort();
      entries.push({
        path: comparePath(playerOne, playerTwo),
        changeFrequency: "weekly",
        priority: playerOne === "haaland" && playerTwo === "mbappe" ? 0.9 : 0.75,
      });
    }
  }

  return entries;
}

export function listNewsSitemapEntries(): SitemapEntry[] {
  return CURATED_NEWS.map((article) => ({
    path: `/news/${article.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));
}

export function listRankingsSitemapEntries(): SitemapEntry[] {
  return [
    { path: "/rankings", changeFrequency: "daily", priority: 0.85 },
    ...RANKING_CATEGORIES.map((category) => ({
      path: `/rankings/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}

export async function listTeamSitemapEntries(): Promise<SitemapEntry[]> {
  const teams = await listTeams();
  return teams.map((team) => ({
    path: teamPath(team.slug),
    changeFrequency: "weekly" as const,
    priority: team.team_type === "club" ? 0.75 : 0.7,
  }));
}

export async function listCompetitionSitemapEntries(): Promise<SitemapEntry[]> {
  const competitions = await listCompetitions();
  return [
    { path: "/competition", changeFrequency: "daily", priority: 0.8 },
    ...competitions.map((competition) => ({
      path: competitionPath(competition.slug),
      changeFrequency: "weekly" as const,
      priority: 0.72,
    })),
  ];
}

/** @deprecated Use split sitemap builders — kept for backwards compatibility. */
export async function listPublicSitemapEntries(): Promise<SitemapEntry[]> {
  const [playerRoutes, compareRoutes] = await Promise.all([
    listPlayerSitemapEntries(),
    listCompareSitemapEntries(),
  ]);

  return [
    ...listStaticSitemapEntries(),
    ...playerRoutes,
    ...compareRoutes,
    ...listNewsSitemapEntries(),
  ];
}

export const SITEMAP_PATHS = {
  main: "/sitemap.xml",
  players: "/sitemaps/players/sitemap.xml",
  compare: "/sitemaps/compare/sitemap.xml",
  news: "/sitemaps/news/sitemap.xml",
  rankings: "/sitemaps/rankings/sitemap.xml",
  teams: "/sitemaps/teams/sitemap.xml",
  competitions: "/sitemaps/competitions/sitemap.xml",
} as const;
