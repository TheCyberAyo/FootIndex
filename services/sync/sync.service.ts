import { DEFAULT_SYNC_SEASON, RECENT_MATCHES_PER_PLAYER } from "@/lib/api-football/constants";
import { isApiFootballConfigured } from "@/lib/api-football/client";
import { getServerEnv, isSupabaseAdminConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  fetchPlayerById,
  fetchRecentFixturesForPlayerClub,
} from "@/services/api-football/endpoints";
import { ServiceError, assertNoError } from "@/services/errors";
import { slugify } from "@/lib/slug";
import {
  mapFixture,
  mapPlayerProfileUpdate,
  mapPositionFromStats,
  mapSeasonStatistics,
} from "@/services/sync/mappers";
import {
  getSyncablePlayerBySlug,
  listSyncablePlayers,
  requireSyncablePlayer,
  type SyncablePlayer,
} from "@/services/sync/syncable-players";

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

async function ensureUniqueTeamSlug(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    let query = supabase.from("teams").select("id").eq("slug", candidate);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    const existing = await query.maybeSingle();
    assertNoError(existing.error, "Failed to check team slug");

    if (!existing.data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
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

  const slug = await ensureUniqueTeamSlug(supabase, slugify(name));

  const inserted = await supabase
    .from("teams")
    .insert({
      slug,
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
  player: SyncablePlayer,
  season: number,
): Promise<Record<string, unknown>> {
  const payload = await fetchPlayerById(player.apiFootballId, season);

  if (!payload) {
    throw new ServiceError(
      `No API-Football player payload for ${player.slug} (${player.apiFootballId})`,
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
    .eq("id", player.id)
    .select("id")
    .maybeSingle();

  assertNoError(playerUpdate.error, `Failed to update player ${player.slug}`);

  if (!playerUpdate.data) {
    throw new ServiceError(
      `Player row missing for ${player.slug}. Run supabase/seed.sql first.`,
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
        player_id: player.id,
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

    assertNoError(upsert.error, `Failed to upsert season stats for ${player.slug}`);
  }

  const careerResult = await supabase
    .from("career_stats")
    .select("goals")
    .eq("player_id", player.id)
    .maybeSingle();
  assertNoError(careerResult.error, "Failed to read curated career stats");

  return {
    slug: player.slug,
    apiId: player.apiFootballId,
    seasonRows: seasonStats.length,
    careerGoalsPreserved: careerResult.data?.goals ?? null,
    careerSource: "curated",
  };
}

async function syncPlayerAppearances(
  player: SyncablePlayer,
  season: number,
): Promise<Record<string, unknown>> {
  if (player.teamApiId == null) {
    return {
      slug: player.slug,
      skipped: true,
      reason: "No club api_football_id on current_team",
    };
  }

  const fixtures = await fetchRecentFixturesForPlayerClub(
    player.teamApiId,
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

    const playerTeamApiId =
      mapped.home_team_api_id === player.teamApiId
        ? mapped.home_team_api_id
        : mapped.away_team_api_id === player.teamApiId
          ? mapped.away_team_api_id
          : mapped.home_team_api_id;
    const playerTeamId =
      playerTeamApiId === mapped.home_team_api_id ? homeTeamId : awayTeamId;

    const statsUpsert = await supabase.from("player_stats").upsert(
      {
        player_id: player.id,
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
      `Failed to upsert appearance for ${player.slug}`,
    );
    appearancesUpserted += 1;
  }

  return {
    slug: player.slug,
    fixturesFetched: fixtures.length,
    matchesUpserted,
    appearancesUpserted,
  };
}

async function syncFixtures(
  players: SyncablePlayer[],
  season: number,
): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {
    perPlayerLimit: RECENT_MATCHES_PER_PLAYER,
  };

  for (const player of players) {
    results[player.slug] = await syncPlayerAppearances(player, season);
  }

  return results;
}

/**
 * Orchestrates API-Football → Supabase sync for every player with api_football_id.
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
  const syncablePlayers = await listSyncablePlayers();
  const details: Record<string, unknown> = {
    season,
    siteUrl: getServerEnv().siteUrl,
    playerCount: syncablePlayers.length,
  };

  if (syncablePlayers.length === 0) {
    details.warning =
      "No players with api_football_id found. Run supabase/seed.sql first.";
  }

  if (job === "players" || job === "all") {
    const playerResults: Record<string, unknown> = {};
    for (const player of syncablePlayers) {
      playerResults[player.slug] = await syncOnePlayer(player, season);
    }
    details.players = playerResults;
  }

  if (job === "fixtures" || job === "all") {
    details.fixtures = await syncFixtures(syncablePlayers, season);
  }

  return {
    job,
    season,
    ok: true,
    details,
  };
}

export async function syncPlayerBySlug(
  slug: string,
  season = resolveSeason(),
): Promise<Record<string, unknown>> {
  const player = requireSyncablePlayer(await getSyncablePlayerBySlug(slug), slug);
  return syncOnePlayer(player, season);
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
