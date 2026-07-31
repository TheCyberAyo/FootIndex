import { unstable_cache } from "next/cache";

import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { playerPath } from "@/lib/players/paths";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listMostSearchedPlayerIds } from "@/services/search/search-history.service";
import { listMostViewedComparisons } from "@/services/compare/comparison-views.service";

export interface AnalyticsPlayerRow {
  playerId: string;
  slug: string;
  name: string;
  shortName: string;
  count: number;
  href: string;
}

import type { EngagementAnalytics } from "@/services/analytics/site-analytics.service";
import { getEngagementAnalytics } from "@/services/analytics/site-analytics.service";

export const EMPTY_ENGAGEMENT: EngagementAnalytics = {
  bounceRate30Days: 0,
  bouncedSessions30Days: 0,
  totalSessions30Days: 0,
  searchClickThroughRate30Days: 0,
  searchClicks30Days: 0,
  searchQueries30Days: 0,
  searchAbandonmentRate30Days: 0,
  abandonedSearches30Days: 0,
  averageSessionDurationSeconds30Days: 0,
  returningVisitorRate30Days: 0,
  returningPageViews30Days: 0,
  totalPageViews30Days: 0,
  notFoundEventsLast7Days: 0,
  notFoundEventsLast30Days: 0,
  topNotFoundPaths: [],
};

export interface AnalyticsComparisonRow {
  key: string;
  playerOneName: string;
  playerTwoName: string;
  count: number;
  href: string;
}

export interface AdminActivityAnalytics {
  searchVolumeLast7Days: number;
  searchVolumeLast30Days: number;
  playerViewsLast7Days: number;
  playerViewsLast30Days: number;
  comparisonViewsLast7Days: number;
  comparisonViewsLast30Days: number;
  mostSearchedPlayers: AnalyticsPlayerRow[];
  mostViewedPlayers: AnalyticsPlayerRow[];
  mostViewedComparisons: AnalyticsComparisonRow[];
  topSearchTerms: Array<{ term: string; count: number }>;
  engagement: EngagementAnalytics;
}

const ANALYTICS_SAMPLE_LIMIT = 5000;

async function loadPlayerSummaries(
  ranked: Array<{ playerId: string; count: number }>,
): Promise<AnalyticsPlayerRow[]> {
  if (ranked.length === 0 || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const playerIds = ranked.map((row) => row.playerId);
  const result = await supabase
    .from("players")
    .select("id, slug, name, short_name")
    .in("id", playerIds);

  if (result.error || !result.data?.length) {
    return [];
  }

  const playerById = new Map(
    result.data.map((row) => [row.id, row]),
  );

  return ranked.flatMap(({ playerId, count }) => {
    const player = playerById.get(playerId);
    if (!player) {
      return [];
    }

    return [
      {
        playerId: player.id,
        slug: player.slug,
        name: player.name,
        shortName: player.short_name,
        count,
        href: playerPath(player.slug),
      },
    ];
  });
}

async function countSince(
  table: "search_history" | "player_views" | "comparison_views",
  column: "created_at" | "viewed_at",
  sinceIso: string,
): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .gte(column, sinceIso);

  return result.count ?? 0;
}

async function listMostViewedPlayerIds(input: {
  limit: number;
  windowDays: number;
}): Promise<Array<{ playerId: string; count: number }>> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return [];
  }

  const since = new Date(
    Date.now() - input.windowDays * 86_400_000,
  ).toISOString();

  try {
    const supabase = createSupabaseAdminClient();
    const result = await supabase
      .from("player_views")
      .select("player_id")
      .gte("viewed_at", since)
      .limit(ANALYTICS_SAMPLE_LIMIT);

    if (result.error || !result.data?.length) {
      return [];
    }

    const counts = new Map<string, number>();
    for (const row of result.data) {
      if (!row.player_id) {
        continue;
      }
      counts.set(row.player_id, (counts.get(row.player_id) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, input.limit)
      .map(([playerId, count]) => ({ playerId, count }));
  } catch {
    return [];
  }
}

async function listTopSearchTerms(input: {
  limit: number;
  windowDays: number;
}): Promise<Array<{ term: string; count: number }>> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return [];
  }

  const since = new Date(
    Date.now() - input.windowDays * 86_400_000,
  ).toISOString();

  try {
    const supabase = createSupabaseAdminClient();
    const result = await supabase
      .from("search_history")
      .select("search_term")
      .gte("created_at", since)
      .limit(ANALYTICS_SAMPLE_LIMIT);

    if (result.error || !result.data?.length) {
      return [];
    }

    const counts = new Map<string, { term: string; count: number }>();
    for (const row of result.data) {
      const term = row.search_term.trim();
      if (term.length < 2) {
        continue;
      }
      const key = term.toLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { term, count: 1 });
      }
    }

    return [...counts.values()]
      .sort((left, right) => right.count - left.count || left.term.localeCompare(right.term))
      .slice(0, input.limit);
  } catch {
    return [];
  }
}

async function getAdminActivityAnalyticsUncached(): Promise<AdminActivityAnalytics> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return {
      searchVolumeLast7Days: 0,
      searchVolumeLast30Days: 0,
      playerViewsLast7Days: 0,
      playerViewsLast30Days: 0,
      comparisonViewsLast7Days: 0,
      comparisonViewsLast30Days: 0,
      mostSearchedPlayers: [],
      mostViewedPlayers: [],
      mostViewedComparisons: [],
      topSearchTerms: [],
      engagement: EMPTY_ENGAGEMENT,
    };
  }

  const now = Date.now();
  const since7 = new Date(now - 7 * 86_400_000).toISOString();
  const since30 = new Date(now - 30 * 86_400_000).toISOString();

  const [
    searchVolumeLast7Days,
    searchVolumeLast30Days,
    playerViewsLast7Days,
    playerViewsLast30Days,
    comparisonViewsLast7Days,
    comparisonViewsLast30Days,
    mostSearchedIds,
    mostViewedIds,
    mostViewedComparisonsRaw,
    topSearchTerms,
    engagement,
  ] = await Promise.all([
    countSince("search_history", "created_at", since7),
    countSince("search_history", "created_at", since30),
    countSince("player_views", "viewed_at", since7),
    countSince("player_views", "viewed_at", since30),
    countSince("comparison_views", "viewed_at", since7),
    countSince("comparison_views", "viewed_at", since30),
    listMostSearchedPlayerIds({ limit: 8, windowDays: 30 }),
    listMostViewedPlayerIds({ limit: 8, windowDays: 30 }),
    listMostViewedComparisons(8, 30),
    listTopSearchTerms({ limit: 8, windowDays: 30 }),
    getEngagementAnalytics(),
  ]);

  const [mostSearchedPlayers, mostViewedPlayers] = await Promise.all([
    loadPlayerSummaries(
      mostSearchedIds.map((row) => ({
        playerId: row.playerId,
        count: row.searchCount,
      })),
    ),
    loadPlayerSummaries(mostViewedIds),
  ]);

  return {
    searchVolumeLast7Days,
    searchVolumeLast30Days,
    playerViewsLast7Days,
    playerViewsLast30Days,
    comparisonViewsLast7Days,
    comparisonViewsLast30Days,
    mostSearchedPlayers,
    mostViewedPlayers,
    mostViewedComparisons: mostViewedComparisonsRaw.map((row) => ({
      key: `${row.playerOneId}:${row.playerTwoId}`,
      playerOneName: row.playerOneName,
      playerTwoName: row.playerTwoName,
      count: row.viewCount,
      href: row.href,
    })),
    topSearchTerms,
    engagement,
  };
}

export async function getAdminActivityAnalytics(): Promise<AdminActivityAnalytics> {
  return unstable_cache(
    getAdminActivityAnalyticsUncached,
    ["admin-activity-analytics"],
    { revalidate: 120 },
  )();
}
