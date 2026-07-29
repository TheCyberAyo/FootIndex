import {
  API_FOOTBALL_PLAYERS,
  DEFAULT_SYNC_SEASON,
  type TrackedPlayerKey,
} from "@/lib/api-football/constants";
import { isApiFootballConfigured } from "@/lib/api-football/client";
import { SEED_PLAYER_IDS } from "@/lib/data/seed-ids";
import { getServerEnv, isSupabaseAdminConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  fetchPlayerById,
  fetchRecentFixturesForPlayerClub,
} from "@/services/api-football/endpoints";
import { RECENT_MATCHES_PER_PLAYER } from "@/lib/api-football/constants";
import { ServiceError, assertNoError } from "@/services/errors";
import {
  mapFixture,
  mapPlayerProfileUpdate,
  mapPositionFromStats,
  mapSeasonStatistics,
} from "@/services/sync/mappers";

export type SyncJob = "players" | "fixtures" | "all";

export interface SyncJobResult {
  job: SyncJob;
  season: number;
  ok: boolean;
  details: Record<string, unknown>;
}

function resolveSeason(): number {
  const raw = process.env.API_FOOTBALL_SEASON;
  if (!raw || raw.trim() === "") {
    return DEFAULT_SYNC_SEASON;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : DEFAULT_SYNC_SEASON;
}

function playerUuidForSlug(slug: string): string {
  if (slug === "haaland") {
    return SEED_PLAYER_IDS.haaland;
  }
  if (slug === "mbappe") {
    return SEED_PLAYER_IDS.mbappe;
  }
  throw new ServiceError(`Unknown player slug: ${slug}`, "UNKNOWN_PLAYER");
}

async function ensureTeamByApiId(
  apiId: number,
  name: string,
  logo: string | null,
): Promise<string> {
  const supabase = createSupabaseAdminClient();

  const existing = await supabase
    .from("teams")
    .select("id")
    .eq("api_football_id", apiId)
    .maybeSingle();

  assertNoError(existing.error, "Failed to look up team");

  if (existing.data) {
    await supabase
      .from("teams")
      .update({
        name,
        short_name: name,
        logo_url: logo,
      })
      .eq("id", existing.data.id);
    return existing.data.id;
  }

  const inserted = await supabase
    .from("teams")
    .insert({
      name,
      short_name: name,
      country: "Unknown",
      team_type: "club",
      logo_url: logo,
      api_football_id: apiId,
    })
    .select("id")
    .single();

  assertNoError(inserted.error, "Failed to insert team");

  if (!inserted.data) {
    throw new ServiceError("Team insert returned no row.", "TEAM_INSERT_EMPTY");
  }

  return inserted.data.id;
}

async function syncOnePlayer(
  key: TrackedPlayerKey,
  season: number,
): Promise<Record<string, unknown>> {
  const config = API_FOOTBALL_PLAYERS[key];
  const playerUuid = playerUuidForSlug(config.slug);
  const payload = await fetchPlayerById(config.apiId, season);

  if (!payload) {
    throw new ServiceError(
      `No API-Football player payload for ${config.slug} (${config.apiId})`,
      "PLAYER_NOT_FOUND",
    );
  }

  const supabase = createSupabaseAdminClient();
  const profile = mapPlayerProfileUpdate(payload.player);
  const position = mapPositionFromStats(payload.statistics);
  const seasonStats = mapSeasonStatistics(payload.statistics, season);

  const primaryTeamStat = payload.statistics[0];
  let currentTeamId: string | null = null;
  if (primaryTeamStat) {
    currentTeamId = await ensureTeamByApiId(
      primaryTeamStat.team.id,
      primaryTeamStat.team.name,
      primaryTeamStat.team.logo,
    );
  }

  const playerUpdate = await supabase
    .from("players")
    .update({
      name: profile.name,
      short_name: profile.short_name,
      date_of_birth: profile.date_of_birth,
      nationality: profile.nationality,
      height_cm: profile.height_cm,
      position,
      image_url: profile.image_url,
      current_team_id: currentTeamId,
      api_football_id: profile.api_football_id,
    })
    .eq("id", playerUuid)
    .select("id")
    .maybeSingle();

  assertNoError(playerUpdate.error, `Failed to update player ${config.slug}`);

  if (!playerUpdate.data) {
    throw new ServiceError(
      `Player row missing for ${config.slug}. Run supabase/seed.sql first.`,
      "PLAYER_ROW_MISSING",
    );
  }

  for (const stat of seasonStats) {
    const teamId = await ensureTeamByApiId(
      stat.teamApiId,
      payload.statistics.find((item) => item.team.id === stat.teamApiId)?.team
        .name ?? "Unknown",
      payload.statistics.find((item) => item.team.id === stat.teamApiId)?.team
        .logo ?? null,
    );

    const upsert = await supabase.from("season_stats").upsert(
      {
        player_id: playerUuid,
        team_id: teamId,
        season: stat.season,
        competition: stat.competition,
        appearances: stat.appearances,
        goals: stat.goals,
        assists: stat.assists,
        minutes: stat.minutes,
        yellow_cards: stat.yellow_cards,
        red_cards: stat.red_cards,
      },
      { onConflict: "player_id,season,competition" },
    );

    assertNoError(upsert.error, `Failed to upsert season stats for ${config.slug}`);
  }

  // Decision: curated career_stats / trophies / awards stay untouched on Free plan.
  // Partial season rows must not overwrite full career baselines.
  const careerResult = await supabase
    .from("career_stats")
    .select("goals")
    .eq("player_id", playerUuid)
    .maybeSingle();
  assertNoError(careerResult.error, "Failed to read curated career stats");

  return {
    slug: config.slug,
    apiId: config.apiId,
    seasonRows: seasonStats.length,
    careerGoalsPreserved: careerResult.data?.goals ?? null,
    careerSource: "curated",
  };
}

async function syncPlayerAppearances(
  key: TrackedPlayerKey,
  season: number,
): Promise<Record<string, unknown>> {
  const config = API_FOOTBALL_PLAYERS[key];
  const playerUuid = playerUuidForSlug(config.slug);
  const fixtures = await fetchRecentFixturesForPlayerClub(
    config.teamApiId,
    season,
    RECENT_MATCHES_PER_PLAYER,
  );
  const supabase = createSupabaseAdminClient();
  let matchesUpserted = 0;
  let appearancesUpserted = 0;

  for (const fixture of fixtures) {
    const mapped = mapFixture(fixture);
    const homeTeamId = await ensureTeamByApiId(
      mapped.home_team_api_id,
      mapped.home_team_name,
      mapped.home_team_logo,
    );
    const awayTeamId = await ensureTeamByApiId(
      mapped.away_team_api_id,
      mapped.away_team_name,
      mapped.away_team_logo,
    );

    const matchUpsert = await supabase
      .from("matches")
      .upsert(
        {
          api_football_id: mapped.api_football_id,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          competition: mapped.competition,
          season: mapped.season,
          kickoff_at: mapped.kickoff_at,
          status: mapped.status,
          home_score: mapped.home_score,
          away_score: mapped.away_score,
          venue: mapped.venue,
        },
        { onConflict: "api_football_id" },
      )
      .select("id")
      .maybeSingle();

    assertNoError(matchUpsert.error, "Failed to upsert match");
    matchesUpserted += 1;

    let matchId = matchUpsert.data?.id ?? null;
    if (!matchId) {
      const existing = await supabase
        .from("matches")
        .select("id")
        .eq("api_football_id", mapped.api_football_id)
        .maybeSingle();
      assertNoError(existing.error, "Failed to load match id after upsert");
      matchId = existing.data?.id ?? null;
    }

    if (!matchId) {
      continue;
    }

    // Player filter means they appeared — attribute to preferred club when present.
    const playerTeamApiId =
      mapped.home_team_api_id === config.teamApiId
        ? mapped.home_team_api_id
        : mapped.away_team_api_id === config.teamApiId
          ? mapped.away_team_api_id
          : mapped.home_team_api_id;
    const playerTeamId =
      playerTeamApiId === mapped.home_team_api_id ? homeTeamId : awayTeamId;

    // Insert-only so curated/seeded line stats are not wiped on re-sync.
    const statsUpsert = await supabase.from("player_stats").upsert(
      {
        player_id: playerUuid,
        match_id: matchId,
        team_id: playerTeamId,
        minutes:
          mapped.status === "finished" || mapped.status === "live" ? 1 : 0,
        goals: 0,
        assists: 0,
      },
      { onConflict: "player_id,match_id", ignoreDuplicates: true },
    );
    assertNoError(
      statsUpsert.error,
      `Failed to upsert appearance for ${config.slug}`,
    );
    appearancesUpserted += 1;
  }

  return {
    slug: config.slug,
    fixturesFetched: fixtures.length,
    matchesUpserted,
    appearancesUpserted,
  };
}

async function syncFixtures(season: number): Promise<Record<string, unknown>> {
  const haaland = await syncPlayerAppearances("haaland", season);
  const mbappe = await syncPlayerAppearances("mbappe", season);
  return {
    perPlayerLimit: RECENT_MATCHES_PER_PLAYER,
    haaland,
    mbappe,
  };
}

/**
 * Orchestrates API-Football → Supabase sync.
 * Decision: admin client only (RLS blocks writes on stats tables for anon).
 */
export async function runSyncJob(job: SyncJob = "all"): Promise<SyncJobResult> {
  if (!isApiFootballConfigured()) {
    throw new ServiceError(
      "API_FOOTBALL_KEY is required for sync.",
      "API_FOOTBALL_NOT_CONFIGURED",
    );
  }
  if (!isSupabaseAdminConfigured()) {
    throw new ServiceError(
      "Supabase service role is required for sync writes.",
      "SUPABASE_ADMIN_NOT_CONFIGURED",
    );
  }

  const season = resolveSeason();
  const details: Record<string, unknown> = {
    season,
    siteUrl: getServerEnv().siteUrl,
  };

  if (job === "players" || job === "all") {
    details.haaland = await syncOnePlayer("haaland", season);
    details.mbappe = await syncOnePlayer("mbappe", season);
  }

  if (job === "fixtures" || job === "all") {
    details.fixtures = await syncFixtures(season);
  }

  return {
    job,
    season,
    ok: true,
    details,
  };
}

export function assertCronAuthorized(authHeader: string | null): void {
  const { cronSecret } = getServerEnv();
  if (!cronSecret) {
    throw new ServiceError(
      "CRON_SECRET is not configured. Set it before calling /api/sync.",
      "CRON_SECRET_MISSING",
    );
  }

  const expected = `Bearer ${cronSecret}`;
  if (authHeader !== expected) {
    throw new ServiceError("Unauthorized sync request.", "SYNC_UNAUTHORIZED");
  }
}
