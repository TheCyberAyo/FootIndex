"use server";

import { DEFAULT_SYNC_SEASON } from "@/lib/api-football/constants";
import { isAdminEnabled } from "@/lib/admin/access";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { searchPlayersByName } from "@/services/api-football/endpoints";
import {
  importPlayerByApiId,
  seedStarterPlayerCatalog,
} from "@/services/players/player-import.service";
import { importWorldSquads } from "@/services/players/world-import.service";
import { runSyncJob } from "@/services/sync/sync.service";
import type { WorldRegion } from "@/lib/data/world-teams";

function assertAdminAccess(): void {
  if (!isAdminEnabled()) {
    throw new Error("Admin tools are disabled.");
  }
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured.");
  }
}

export async function adminSearchApiFootballPlayers(query: string) {
  assertAdminAccess();
  const results = await searchPlayersByName(query.trim(), DEFAULT_SYNC_SEASON);

  return results.slice(0, 10).map((item) => ({
    apiFootballId: item.player.id,
    name: item.player.name,
    nationality: item.player.nationality,
    age: item.player.age,
    photo: item.player.photo,
    club: item.statistics[0]?.team.name ?? null,
    league: item.statistics[0]?.league.name ?? null,
  }));
}

export async function adminImportPlayer(apiFootballId: number, slug?: string) {
  assertAdminAccess();
  return importPlayerByApiId(apiFootballId, slug);
}

export async function adminSeedCatalog() {
  assertAdminAccess();
  return seedStarterPlayerCatalog();
}

export async function adminImportWorldSquads(input: {
  region?: WorldRegion;
  offset?: number;
  maxTeams?: number;
}) {
  assertAdminAccess();
  return importWorldSquads({
    region: input.region ?? "all",
    offset: input.offset,
    maxTeams: input.maxTeams,
    sync: false,
  });
}

export async function adminRunSync(input: {
  job: "players" | "fixtures" | "all";
  offset?: number;
  limit?: number;
  delayMs?: number;
}) {
  assertAdminAccess();
  return runSyncJob(input.job, {
    offset: input.offset,
    limit: input.limit,
    delayMs: input.delayMs,
  });
}

export async function adminGetPipelineStats() {
  assertAdminAccess();
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();

  const [players, competitions, transfers, cache] = await Promise.all([
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("competitions").select("id", { count: "exact", head: true }),
    supabase.from("transfers").select("id", { count: "exact", head: true }),
    supabase
      .from("comparison_cache")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    players: players.count ?? 0,
    competitions: competitions.count ?? 0,
    transfers: transfers.count ?? 0,
    comparisonCacheEntries: cache.count ?? 0,
  };
}

export async function adminGetActivityAnalytics() {
  assertAdminAccess();
  const { getAdminActivityAnalytics } = await import(
    "@/services/analytics/activity-analytics.service"
  );
  return getAdminActivityAnalytics();
}
