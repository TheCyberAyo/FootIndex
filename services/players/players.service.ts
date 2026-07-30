import { FEATURED_RIVALRY } from "@/lib/brand/featured-rivalry";
import {
  buildLocalPlayerProfile,
  localPlayers,
} from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError, ServiceError } from "@/services/errors";
import { listTransfersByPlayerId } from "@/services/players/transfers.service";
import type {
  AwardRow,
  CareerStatRow,
  PlayerRow,
  SeasonStatRow,
  TeamRow,
  TrophyRow,
} from "@/types/database";
import type { Player, PlayerProfile, SeasonStats, Trophy } from "@/types/domain";

interface PlayerWithTeam extends PlayerRow {
  current_team: TeamRow | TeamRow[] | null;
}

interface SeasonWithTeam extends SeasonStatRow {
  team: TeamRow | TeamRow[] | null;
}

interface TrophyWithTeam extends TrophyRow {
  team: TeamRow | TeamRow[] | null;
}

function mapTeamRelation(
  team: TeamRow | TeamRow[] | null | undefined,
): TeamRow | null {
  if (!team) {
    return null;
  }
  return Array.isArray(team) ? (team[0] ?? null) : team;
}

function mapPlayer(row: PlayerWithTeam): Player {
  return {
    ...row,
    current_team: mapTeamRelation(row.current_team),
  };
}

function mapSeason(row: SeasonWithTeam): SeasonStats {
  return {
    ...row,
    team: mapTeamRelation(row.team),
  };
}

function mapTrophy(row: TrophyWithTeam): Trophy {
  return {
    ...row,
    team: mapTeamRelation(row.team),
  };
}

async function fetchPlayerProfileFromSupabase(
  slug: string,
): Promise<PlayerProfile | null> {
  const supabase = createSupabasePublicClient();

  const playerResult = await supabase
    .from("players")
    .select("*, current_team:teams!players_current_team_id_fkey(*)")
    .eq("slug", slug)
    .maybeSingle();

  assertNoError(playerResult.error, `Failed to load player: ${slug}`);

  if (!playerResult.data) {
    return null;
  }

  const player = mapPlayer(playerResult.data as PlayerWithTeam);

  const [careerResult, seasonsResult, awardsResult, trophiesResult, transfers] =
    await Promise.all([
      supabase
        .from("career_stats")
        .select("*")
        .eq("player_id", player.id)
        .maybeSingle(),
      supabase
        .from("season_stats")
        .select("*, team:teams(*)")
        .eq("player_id", player.id)
        .order("season", { ascending: false }),
      supabase
        .from("awards")
        .select("*")
        .eq("player_id", player.id)
        .order("year", { ascending: false }),
      supabase
        .from("trophies")
        .select("*, team:teams(*)")
        .eq("player_id", player.id)
        .order("year", { ascending: false }),
      listTransfersByPlayerId(player.id),
    ]);

  assertNoError(careerResult.error, "Failed to load career stats");
  assertNoError(seasonsResult.error, "Failed to load season stats");
  assertNoError(awardsResult.error, "Failed to load awards");
  assertNoError(trophiesResult.error, "Failed to load trophies");

  const career = careerResult.data as CareerStatRow | null;
  const seasons = (seasonsResult.data ?? []) as SeasonWithTeam[];
  const awards = (awardsResult.data ?? []) as AwardRow[];
  const trophies = (trophiesResult.data ?? []) as TrophyWithTeam[];

  return {
    player,
    career: career
      ? {
          ...career,
          goals_per_game: Number(career.goals_per_game),
        }
      : null,
    seasons: seasons.map(mapSeason),
    awards,
    trophies: trophies.map(mapTrophy),
    transfers,
  };
}

const SUPABASE_PAGE_SIZE = 1000;

async function fetchAllPlayersFromSupabase(): Promise<Player[]> {
  const supabase = createSupabasePublicClient();
  const rows: PlayerWithTeam[] = [];
  let from = 0;

  while (true) {
    const result = await supabase
      .from("players")
      .select("*, current_team:teams!players_current_team_id_fkey(*)")
      .order("name", { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    assertNoError(result.error, "Failed to list players");

    const page = (result.data ?? []) as PlayerWithTeam[];
    rows.push(...page);

    if (page.length < SUPABASE_PAGE_SIZE) {
      break;
    }

    from += SUPABASE_PAGE_SIZE;
  }

  return rows.map(mapPlayer);
}

/**
 * Players service — UI talks here, never to Supabase directly (SRP + DIP).
 */
export async function listPlayers(): Promise<Player[]> {
  if (!isSupabaseConfigured()) {
    return localPlayers;
  }

  try {
    return await fetchAllPlayersFromSupabase();
  } catch {
    return localPlayers;
  }
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  const profile = await getPlayerProfileBySlug(slug);
  return profile?.player ?? null;
}

export async function getPlayerProfileBySlug(
  slug: string,
): Promise<PlayerProfile | null> {
  if (!isSupabaseConfigured()) {
    return buildLocalPlayerProfile(slug);
  }

  try {
    return await fetchPlayerProfileFromSupabase(slug);
  } catch {
    // Graceful degradation for build-time / outages
    return buildLocalPlayerProfile(slug);
  }
}

export async function getFeaturedRivalryProfiles(): Promise<{
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
}> {
  const [playerOne, playerTwo] = await Promise.all([
    getPlayerProfileBySlug(FEATURED_RIVALRY.playerOneSlug),
    getPlayerProfileBySlug(FEATURED_RIVALRY.playerTwoSlug),
  ]);

  if (!playerOne || !playerTwo) {
    throw new ServiceError(
      "Featured comparison requires both rivalry profiles.",
      "MISSING_PLAYER",
    );
  }

  return { playerOne, playerTwo };
}

/** @deprecated Use getFeaturedRivalryProfiles */
export async function getComparisonProfiles(): Promise<{
  haaland: PlayerProfile;
  mbappe: PlayerProfile;
}> {
  const { playerOne, playerTwo } = await getFeaturedRivalryProfiles();
  return { haaland: playerOne, mbappe: playerTwo };
}
