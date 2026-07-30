import {
  listWorldTeams,
  type WorldRegion,
  type WorldTeamSeed,
} from "@/lib/data/world-teams";
import { DEFAULT_SYNC_SEASON } from "@/lib/api-football/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchTeamSquad } from "@/services/api-football/endpoints";
import { assertNoError, ServiceError } from "@/services/errors";
import { importPlayerByApiId } from "@/services/players/player-import.service";
import { ensureTeamByApiRef } from "@/services/reference/reference-entities.service";
import { mapPosition } from "@/services/sync/mappers";
import type { ApiFootballSquadPlayer } from "@/lib/api-football/types";
import type { PlayerPosition } from "@/types/database";

export interface WorldImportOptions {
  region?: WorldRegion;
  /** Skip the first N teams in the region list (for batched imports). */
  offset?: number;
  maxTeams?: number;
  sync?: boolean;
  delayMs?: number;
}

export interface WorldTeamImportResult {
  team: WorldTeamSeed;
  playersFound: number;
  created: number;
  skipped: number;
  synced: number;
  error?: string;
}

export interface WorldImportSummary {
  teamsProcessed: number;
  playersCreated: number;
  playersSkipped: number;
  playersSynced: number;
  results: WorldTeamImportResult[];
}

function estimateDateOfBirth(age: number | null): string {
  if (!age || age <= 0) {
    return "1995-01-01";
  }
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

function mapSquadPosition(position: string | null): PlayerPosition {
  return mapPosition(position);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function ensureUniquePlayerSlug(baseSlug: string): Promise<string> {
  const supabase = createSupabaseAdminClient();
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await supabase
      .from("players")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    assertNoError(existing.error, "Failed to check player slug");

    if (!existing.data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function importSquadPlayer(
  squadPlayer: ApiFootballSquadPlayer,
  team: WorldTeamSeed,
  teamId: string,
): Promise<"created" | "skipped"> {
  const supabase = createSupabaseAdminClient();

  const existingByApi = await supabase
    .from("players")
    .select("id, current_team_id")
    .eq("api_football_id", squadPlayer.id)
    .maybeSingle();

  assertNoError(existingByApi.error, "Failed to look up player by API id");

  if (existingByApi.data) {
    if (!existingByApi.data.current_team_id) {
      await supabase
        .from("players")
        .update({ current_team_id: teamId })
        .eq("id", existingByApi.data.id);
    }
    return "skipped";
  }

  const baseSlug = slugify(squadPlayer.name) || `player-${squadPlayer.id}`;
  const slug = await ensureUniquePlayerSlug(baseSlug);
  const shortName = squadPlayer.name.split(" ").pop() ?? squadPlayer.name;

  const inserted = await supabase.from("players").insert({
    slug,
    name: squadPlayer.name,
    short_name: shortName,
    date_of_birth: estimateDateOfBirth(squadPlayer.age),
    nationality: team.country,
    height_cm: 180,
    position: mapSquadPosition(squadPlayer.position),
    bio: `${squadPlayer.name} — ${team.name}, ${team.league}. Profile on FootIndex.`,
    image_url: squadPlayer.photo,
    api_football_id: squadPlayer.id,
    current_team_id: teamId,
  });

  assertNoError(inserted.error, `Failed to insert squad player ${squadPlayer.name}`);

  return "created";
}

async function importTeamSquad(
  team: WorldTeamSeed,
  sync: boolean,
  season: number,
): Promise<WorldTeamImportResult> {
  const squad = await fetchTeamSquad(team.apiTeamId);

  if (!squad || squad.players.length === 0) {
    return {
      team,
      playersFound: 0,
      created: 0,
      skipped: 0,
      synced: 0,
      error: "No squad returned from API-Football",
    };
  }

  const teamId = await ensureTeamByApiRef({
    apiId: squad.team.id,
    name: squad.team.name,
    logo: squad.team.logo,
    countryName: team.country,
    teamType: "club",
  });

  let created = 0;
  let skipped = 0;
  let synced = 0;

  for (const squadPlayer of squad.players) {
    const outcome = await importSquadPlayer(squadPlayer, team, teamId);
    if (outcome === "created") {
      created += 1;
    } else {
      skipped += 1;
    }

    if (sync) {
      try {
        await importPlayerByApiId(squadPlayer.id, undefined, season);
        synced += 1;
      } catch {
        // Keep importing roster even if one sync fails.
      }
    }
  }

  return {
    team,
    playersFound: squad.players.length,
    created,
    skipped,
    synced,
  };
}

/**
 * Import squads from clubs worldwide (1 API call per team).
 * Default: insert-only (no per-player sync) to respect free-plan rate limits.
 */
export async function importWorldSquads(
  options: WorldImportOptions = {},
): Promise<WorldImportSummary> {
  if (!isSupabaseConfigured()) {
    throw new ServiceError(
      "World import requires Supabase admin configuration.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  const region = options.region ?? "all";
  const allTeams = listWorldTeams(region);
  const offset = Math.max(0, options.offset ?? 0);
  const maxTeams = options.maxTeams ?? allTeams.length - offset;
  const sync = options.sync ?? false;
  const delayMs = options.delayMs ?? 350;
  const season = DEFAULT_SYNC_SEASON;

  const teams = allTeams.slice(offset, offset + maxTeams);
  const results: WorldTeamImportResult[] = [];

  for (let index = 0; index < teams.length; index += 1) {
    const team = teams[index];

    try {
      results.push(await importTeamSquad(team, sync, season));
    } catch (error) {
      results.push({
        team,
        playersFound: 0,
        created: 0,
        skipped: 0,
        synced: 0,
        error:
          error instanceof Error ? error.message : "Unknown import failure",
      });
    }

    if (index < teams.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return {
    teamsProcessed: results.length,
    playersCreated: results.reduce((sum, row) => sum + row.created, 0),
    playersSkipped: results.reduce((sum, row) => sum + row.skipped, 0),
    playersSynced: results.reduce((sum, row) => sum + row.synced, 0),
    results,
  };
}
