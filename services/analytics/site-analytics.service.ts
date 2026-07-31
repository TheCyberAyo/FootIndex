import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ANALYTICS_SAMPLE_LIMIT = 5000;

export async function recordSitePageView(input: {
  sessionId: string;
  visitorId: string;
  path: string;
  referrer?: string | null;
  userId?: string | null;
}): Promise<{ isReturning: boolean }> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return { isReturning: false };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();
    const existing = await supabase
      .from("analytics_visitors")
      .select("visit_count")
      .eq("visitor_id", input.visitorId)
      .maybeSingle();

    const isReturning = Boolean(existing.data);

    if (existing.data) {
      await supabase
        .from("analytics_visitors")
        .update({
          last_seen_at: now,
          visit_count: (existing.data.visit_count ?? 1) + 1,
        })
        .eq("visitor_id", input.visitorId);
    } else {
      await supabase.from("analytics_visitors").insert({
        visitor_id: input.visitorId,
        first_seen_at: now,
        last_seen_at: now,
        visit_count: 1,
      });
    }

    await supabase.from("site_page_views").insert({
      session_id: input.sessionId,
      visitor_id: input.visitorId,
      user_id: input.userId ?? null,
      path: input.path,
      referrer: input.referrer ?? null,
      is_returning: isReturning,
    });

    return { isReturning };
  } catch {
    return { isReturning: false };
  }
}

export async function recordSiteNotFound(input: {
  sessionId?: string | null;
  visitorId?: string | null;
  path: string;
  referrer?: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("site_not_found_events").insert({
      session_id: input.sessionId ?? null,
      visitor_id: input.visitorId ?? null,
      path: input.path,
      referrer: input.referrer ?? null,
    });
  } catch {
    // Analytics tables optional until migration is applied.
  }
}

export interface EngagementAnalytics {
  bounceRate30Days: number;
  bouncedSessions30Days: number;
  totalSessions30Days: number;
  searchClickThroughRate30Days: number;
  searchClicks30Days: number;
  searchQueries30Days: number;
  searchAbandonmentRate30Days: number;
  abandonedSearches30Days: number;
  averageSessionDurationSeconds30Days: number;
  returningVisitorRate30Days: number;
  returningPageViews30Days: number;
  totalPageViews30Days: number;
  notFoundEventsLast7Days: number;
  notFoundEventsLast30Days: number;
  topNotFoundPaths: Array<{ path: string; count: number }>;
}

function percentage(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}

async function computeBounceRate(sinceIso: string): Promise<{
  bounceRate: number;
  bouncedSessions: number;
  totalSessions: number;
}> {
  const supabase = createSupabaseAdminClient();
  const pageViews = await supabase
    .from("site_page_views")
    .select("session_id, created_at")
    .gte("created_at", sinceIso)
    .limit(ANALYTICS_SAMPLE_LIMIT);

  if (pageViews.error || !pageViews.data?.length) {
    return { bounceRate: 0, bouncedSessions: 0, totalSessions: 0 };
  }

  const viewsBySession = new Map<string, number>();
  for (const row of pageViews.data) {
    viewsBySession.set(
      row.session_id,
      (viewsBySession.get(row.session_id) ?? 0) + 1,
    );
  }

  const singlePageSessions = [...viewsBySession.entries()]
    .filter(([, count]) => count === 1)
    .map(([sessionId]) => sessionId);

  if (singlePageSessions.length === 0) {
    return {
      bounceRate: 0,
      bouncedSessions: 0,
      totalSessions: viewsBySession.size,
    };
  }

  const [playerViews, searchClicks] = await Promise.all([
    supabase
      .from("player_views")
      .select("session_id")
      .in("session_id", singlePageSessions)
      .gte("viewed_at", sinceIso),
    supabase
      .from("search_history")
      .select("session_id")
      .in("session_id", singlePageSessions)
      .not("player_id", "is", null)
      .gte("created_at", sinceIso),
  ]);

  const engagedSessions = new Set<string>();
  for (const row of playerViews.data ?? []) {
    if (row.session_id) {
      engagedSessions.add(row.session_id);
    }
  }
  for (const row of searchClicks.data ?? []) {
    if (row.session_id) {
      engagedSessions.add(row.session_id);
    }
  }

  const bouncedSessions = singlePageSessions.filter(
    (sessionId) => !engagedSessions.has(sessionId),
  ).length;

  return {
    bounceRate: percentage(bouncedSessions, viewsBySession.size),
    bouncedSessions,
    totalSessions: viewsBySession.size,
  };
}

async function computeSearchCtr(sinceIso: string): Promise<{
  rate: number;
  clicks: number;
  queries: number;
}> {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("search_history")
    .select("player_id")
    .gte("created_at", sinceIso)
    .limit(ANALYTICS_SAMPLE_LIMIT);

  if (result.error || !result.data?.length) {
    return { rate: 0, clicks: 0, queries: 0 };
  }

  const queries = result.data.length;
  const clicks = result.data.filter((row) => row.player_id).length;

  return {
    rate: percentage(clicks, queries),
    clicks,
    queries,
  };
}

async function computeSearchAbandonment(sinceIso: string): Promise<{
  rate: number;
  abandoned: number;
  queries: number;
}> {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("search_history")
    .select("player_id")
    .gte("created_at", sinceIso)
    .limit(ANALYTICS_SAMPLE_LIMIT);

  if (result.error || !result.data?.length) {
    return { rate: 0, abandoned: 0, queries: 0 };
  }

  const queries = result.data.length;
  const clicks = result.data.filter((row) => row.player_id).length;
  const abandoned = queries - clicks;

  return {
    rate: percentage(abandoned, queries),
    abandoned,
    queries,
  };
}

async function computeAverageSessionDuration(sinceIso: string): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("site_page_views")
    .select("session_id, created_at")
    .gte("created_at", sinceIso)
    .limit(ANALYTICS_SAMPLE_LIMIT);

  if (result.error || !result.data?.length) {
    return 0;
  }

  const bounds = new Map<string, { min: number; max: number }>();
  for (const row of result.data) {
    const timestamp = new Date(row.created_at).getTime();
    const existing = bounds.get(row.session_id);
    if (!existing) {
      bounds.set(row.session_id, { min: timestamp, max: timestamp });
      continue;
    }
    existing.min = Math.min(existing.min, timestamp);
    existing.max = Math.max(existing.max, timestamp);
  }

  const durations = [...bounds.values()].map(
    (entry) => (entry.max - entry.min) / 1000,
  );

  if (durations.length === 0) {
    return 0;
  }

  const total = durations.reduce((sum, value) => sum + value, 0);
  return Math.round(total / durations.length);
}

async function computeReturningVisitorRate(sinceIso: string): Promise<{
  rate: number;
  returningViews: number;
  totalViews: number;
}> {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("site_page_views")
    .select("is_returning")
    .gte("created_at", sinceIso)
    .limit(ANALYTICS_SAMPLE_LIMIT);

  if (result.error || !result.data?.length) {
    return { rate: 0, returningViews: 0, totalViews: 0 };
  }

  const totalViews = result.data.length;
  const returningViews = result.data.filter((row) => row.is_returning).length;

  return {
    rate: percentage(returningViews, totalViews),
    returningViews,
    totalViews,
  };
}

async function listTopNotFoundPaths(input: {
  sinceIso: string;
  limit: number;
}): Promise<Array<{ path: string; count: number }>> {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("site_not_found_events")
    .select("path")
    .gte("created_at", input.sinceIso)
    .limit(ANALYTICS_SAMPLE_LIMIT);

  if (result.error || !result.data?.length) {
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of result.data) {
    counts.set(row.path, (counts.get(row.path) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, input.limit)
    .map(([path, count]) => ({ path, count }));
}

export async function getEngagementAnalytics(): Promise<EngagementAnalytics> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return {
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
  }

  const now = Date.now();
  const since7 = new Date(now - 7 * 86_400_000).toISOString();
  const since30 = new Date(now - 30 * 86_400_000).toISOString();
  const supabase = createSupabaseAdminClient();

  const [
    bounce,
    ctr,
    abandonment,
    averageSessionDurationSeconds30Days,
    returning,
    notFound7,
    notFound30,
    topNotFoundPaths,
  ] = await Promise.all([
    computeBounceRate(since30),
    computeSearchCtr(since30),
    computeSearchAbandonment(since30),
    computeAverageSessionDuration(since30),
    computeReturningVisitorRate(since30),
    supabase
      .from("site_not_found_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since7),
    supabase
      .from("site_not_found_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since30),
    listTopNotFoundPaths({ sinceIso: since30, limit: 8 }),
  ]);

  return {
    bounceRate30Days: bounce.bounceRate,
    bouncedSessions30Days: bounce.bouncedSessions,
    totalSessions30Days: bounce.totalSessions,
    searchClickThroughRate30Days: ctr.rate,
    searchClicks30Days: ctr.clicks,
    searchQueries30Days: ctr.queries,
    searchAbandonmentRate30Days: abandonment.rate,
    abandonedSearches30Days: abandonment.abandoned,
    averageSessionDurationSeconds30Days,
    returningVisitorRate30Days: returning.rate,
    returningPageViews30Days: returning.returningViews,
    totalPageViews30Days: returning.totalViews,
    notFoundEventsLast7Days: notFound7.count ?? 0,
    notFoundEventsLast30Days: notFound30.count ?? 0,
    topNotFoundPaths,
  };
}
