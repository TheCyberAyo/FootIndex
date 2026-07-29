import {
  buildLocalPlayerSearchResults,
  searchLocalPlayers,
} from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { getPlayerAge, formatPosition } from "@/lib/players/format";
import { playerPath } from "@/lib/players/paths";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import type { PlayerSearchResult } from "@/types/domain";

const DEFAULT_LIMIT = 8;
const MIN_QUERY_LENGTH = 2;

interface SearchPlayersRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  date_of_birth: string;
  nationality: string;
  player_position: PlayerSearchResult["position"];
  image_url: string | null;
  club_name: string | null;
  club_logo_url: string | null;
  competition: string | null;
  search_rank: number | null;
}

function mapSearchRow(row: SearchPlayersRow): PlayerSearchResult {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    age: getPlayerAge(row.date_of_birth),
    nationality: row.nationality,
    position: row.player_position,
    positionLabel: formatPosition(row.player_position),
    imageUrl: row.image_url,
    clubName: row.club_name,
    clubLogoUrl: row.club_logo_url,
    competition: row.competition,
    href: playerPath(row.slug),
  };
}

async function searchPlayersFromSupabase(
  query: string,
  limit: number,
): Promise<PlayerSearchResult[]> {
  const supabase = createSupabasePublicClient();
  const result = await supabase.rpc("search_players", {
    search_query: query,
    result_limit: limit,
  });

  assertNoError(result.error, "Failed to search players");

  return ((result.data ?? []) as SearchPlayersRow[]).map(mapSearchRow);
}

/**
 * Player search — Supabase FTS + local seed fallback (PROJECT_SPEC §43).
 */
export async function searchPlayers(
  query: string,
  limit = DEFAULT_LIMIT,
): Promise<PlayerSearchResult[]> {
  const normalized = query.trim();
  if (normalized.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const boundedLimit = Math.max(1, Math.min(limit, 25));

  if (!isSupabaseConfigured()) {
    return searchLocalPlayers(normalized, boundedLimit);
  }

  try {
    return await searchPlayersFromSupabase(normalized, boundedLimit);
  } catch {
    return searchLocalPlayers(normalized, boundedLimit);
  }
}

export async function listTrendingPlayers(
  limit = 6,
): Promise<PlayerSearchResult[]> {
  if (!isSupabaseConfigured()) {
    return buildLocalPlayerSearchResults().slice(0, limit);
  }

  try {
    const supabase = createSupabasePublicClient();
    const result = await supabase
      .from("players")
      .select(
        "id, slug, name, short_name, date_of_birth, nationality, position, image_url, current_team:teams!players_current_team_id_fkey(name, logo_url)",
      )
      .order("name", { ascending: true })
      .limit(limit);

    assertNoError(result.error, "Failed to list trending players");

    const playerIds = (result.data ?? []).map((row) => row.id);
    const competitions = await fetchLatestCompetitions(playerIds);

    return (result.data ?? []).map((row) => {
      const team = Array.isArray(row.current_team)
        ? row.current_team[0]
        : row.current_team;

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        shortName: row.short_name,
        age: getPlayerAge(row.date_of_birth),
        nationality: row.nationality,
        position: row.position,
        positionLabel: formatPosition(row.position),
        imageUrl: row.image_url,
        clubName: team?.name ?? null,
        clubLogoUrl: team?.logo_url ?? null,
        competition: competitions.get(row.id) ?? null,
        href: playerPath(row.slug),
      };
    });
  } catch {
    return buildLocalPlayerSearchResults().slice(0, limit);
  }
}

async function fetchLatestCompetitions(
  playerIds: string[],
): Promise<Map<string, string>> {
  if (playerIds.length === 0) {
    return new Map();
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("season_stats")
    .select("player_id, competition, season")
    .in("player_id", playerIds)
    .order("season", { ascending: false });

  assertNoError(result.error, "Failed to load competitions");

  const map = new Map<string, string>();
  for (const row of result.data ?? []) {
    if (!map.has(row.player_id)) {
      map.set(row.player_id, row.competition);
    }
  }
  return map;
}

export { MIN_QUERY_LENGTH, DEFAULT_LIMIT as SEARCH_DEFAULT_LIMIT };
