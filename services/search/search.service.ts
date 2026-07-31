import { unstable_cache } from "next/cache";

import {
  buildLocalPlayerSearchResults,
  searchLocalPlayers,
} from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { getPlayerAge, formatPosition } from "@/lib/players/format";
import { playerPath } from "@/lib/players/paths";
import { PLAYER_SEARCH_CACHE_TAG } from "@/lib/search/cache";
import { applySearchFilters } from "@/lib/search/apply-filters";
import type { PlayerSearchFilters } from "@/lib/search/filters";
import { filtersCacheKey } from "@/lib/search/filters";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import { listMostSearchedPlayerIds } from "@/services/search/search-history.service";
import type { PlayerSearchResult } from "@/types/domain";

const DEFAULT_LIMIT = 8;
const MIN_QUERY_LENGTH = 2;
const SEARCH_CACHE_SECONDS = 10;

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

function filterLocalPlayers(
  query: string,
  limit: number,
  filters?: PlayerSearchFilters,
): PlayerSearchResult[] {
  return applySearchFilters(searchLocalPlayers(query, limit), filters).slice(
    0,
    limit,
  );
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

interface PlayerSelectRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  date_of_birth: string;
  nationality: string;
  position: PlayerSearchResult["position"];
  image_url: string | null;
  current_team:
    | { name: string; logo_url: string | null }
    | { name: string; logo_url: string | null }[]
    | null;
}

function mapPlayerSelectRow(
  row: PlayerSelectRow,
  competitions: Map<string, string>,
): PlayerSearchResult {
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
}

/**
 * Direct ilike fallback when search_players RPC is missing or failing.
 * Queries the full players table — not limited to local seed.
 */
async function searchPlayersIlike(
  query: string,
  limit: number,
  filters?: PlayerSearchFilters,
): Promise<PlayerSearchResult[]> {
  const supabase = createSupabasePublicClient();
  const sanitized = query.trim().replace(/[%_]/g, "");
  if (sanitized.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const pattern = `%${sanitized.replace(/"/g, "")}%`;
  const filter = [
    `name.ilike."${pattern}"`,
    `short_name.ilike."${pattern}"`,
    `slug.ilike."${pattern}"`,
    `nationality.ilike."${pattern}"`,
    `current_club_name.ilike."${pattern}"`,
  ].join(",");

  let builder = supabase
    .from("players")
    .select(
      "id, slug, name, short_name, date_of_birth, nationality, position, image_url, current_team:teams!players_current_team_id_fkey(name, logo_url)",
    )
    .or(filter)
    .order("name", { ascending: true })
    .limit(limit);

  if (filters?.position) {
    builder = builder.eq("position", filters.position);
  }

  if (filters?.nationality) {
    builder = builder.ilike("nationality", `%${filters.nationality.replace(/[%_]/g, "")}%`);
  }

  if (filters?.club) {
    builder = builder.ilike(
      "current_club_name",
      `%${filters.club.replace(/[%_]/g, "")}%`,
    );
  }

  const result = await builder;

  assertNoError(result.error, "Failed to search players");

  const rows = (result.data ?? []) as PlayerSelectRow[];
  let competitions = new Map<string, string>();
  try {
    competitions = await fetchLatestCompetitions(rows.map((row) => row.id));
  } catch {
    // Club/competition enrichment is optional for search suggestions.
  }

  return rows.map((row) => mapPlayerSelectRow(row, competitions));
}

/**
 * Player search — Supabase FTS → ilike fallback → local seed (PROJECT_SPEC §43).
 */
async function searchPlayersUncached(
  query: string,
  limit: number,
  filters?: PlayerSearchFilters,
): Promise<PlayerSearchResult[]> {
  if (!isSupabaseConfigured()) {
    return filterLocalPlayers(query, limit, filters);
  }

  const fetchLimit = filters ? Math.min(limit * 3, 25) : limit;

  try {
    const rpcResults = applySearchFilters(
      await searchPlayersFromSupabase(query, fetchLimit),
      filters,
    ).slice(0, limit);

    if (rpcResults.length > 0) {
      return rpcResults;
    }

    return await searchPlayersIlike(query, limit, filters);
  } catch {
    try {
      return await searchPlayersIlike(query, limit, filters);
    } catch {
      return filterLocalPlayers(query, limit, filters);
    }
  }
}

export async function searchPlayers(
  query: string,
  limit = DEFAULT_LIMIT,
  filters?: PlayerSearchFilters,
): Promise<PlayerSearchResult[]> {
  const normalized = query.trim();
  if (normalized.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const boundedLimit = Math.max(1, Math.min(limit, 25));
  const cacheKey = normalized.toLowerCase();

  return unstable_cache(
    () => searchPlayersUncached(normalized, boundedLimit, filters),
    [
      "player-search",
      cacheKey,
      String(boundedLimit),
      filtersCacheKey(filters),
    ],
    { revalidate: SEARCH_CACHE_SECONDS, tags: [PLAYER_SEARCH_CACHE_TAG] },
  )();
}

interface TrendingCareerRow {
  goals: number;
  player:
    | PlayerSelectRow
    | PlayerSelectRow[]
    | null;
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
      .from("career_stats")
      .select(
        "goals, player:players!inner(id, slug, name, short_name, date_of_birth, nationality, position, image_url, current_team:teams!players_current_team_id_fkey(name, logo_url))",
      )
      .order("goals", { ascending: false })
      .order("player_id", { ascending: true })
      .limit(limit);

    assertNoError(result.error, "Failed to list trending players");

    const rows = (result.data ?? []) as TrendingCareerRow[];
    const playerRows = rows.flatMap((row) => {
      if (!row.player) {
        return [];
      }
      return Array.isArray(row.player) ? row.player : [row.player];
    });
    const competitions = await fetchLatestCompetitions(
      playerRows.map((row) => row.id),
    );

    return playerRows.map((row) => mapPlayerSelectRow(row, competitions));
  } catch {
    return buildLocalPlayerSearchResults().slice(0, limit);
  }
}

export async function listMostSearchedPlayers(
  limit = 9,
): Promise<PlayerSearchResult[]> {
  const boundedLimit = Math.max(1, Math.min(limit, 20));

  try {
    const ranked = await listMostSearchedPlayerIds({ limit: boundedLimit });

    if (ranked.length === 0) {
      return listTrendingPlayers(boundedLimit);
    }

    if (!isSupabaseConfigured()) {
      return buildLocalPlayerSearchResults().slice(0, boundedLimit);
    }

    const supabase = createSupabasePublicClient();
    const playerIds = ranked.map((row) => row.playerId);
    const result = await supabase
      .from("players")
      .select(
        "id, slug, name, short_name, date_of_birth, nationality, position, image_url, current_team:teams!players_current_team_id_fkey(name, logo_url)",
      )
      .in("id", playerIds);

    assertNoError(result.error, "Failed to load most searched players");

    const rows = (result.data ?? []) as PlayerSelectRow[];
    const rowById = new Map(rows.map((row) => [row.id, row]));
    const competitions = await fetchLatestCompetitions(playerIds);

    return ranked.flatMap(({ playerId }) => {
      const row = rowById.get(playerId);
      return row ? [mapPlayerSelectRow(row, competitions)] : [];
    });
  } catch {
    return listTrendingPlayers(boundedLimit);
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
export type { PlayerSearchFilters } from "@/lib/search/filters";
