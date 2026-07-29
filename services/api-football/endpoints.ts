import { apiFootballFetch } from "@/lib/api-football/client";
import type {
  ApiFootballFixtureItem,
  ApiFootballPlayerResponseItem,
  ApiFootballTrophyItem,
} from "@/lib/api-football/types";

export async function fetchPlayerById(
  playerId: number,
  season: number,
): Promise<ApiFootballPlayerResponseItem | null> {
  const { data } = await apiFootballFetch<ApiFootballPlayerResponseItem[]>(
    "/players",
    { id: playerId, season },
  );
  return data[0] ?? null;
}

export async function fetchRecentFixturesByTeam(
  teamId: number,
  season: number,
  limit = 5,
): Promise<ApiFootballFixtureItem[]> {
  /**
   * Decision: Free plan rejects `last` / `next` query params.
   * Fetch season fixtures for the team, then keep the most recent N locally.
   */
  const { data } = await apiFootballFetch<ApiFootballFixtureItem[]>(
    "/fixtures",
    { team: teamId, season },
  );

  return [...data]
    .sort(
      (a, b) =>
        new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime(),
    )
    .slice(0, limit);
}

/**
 * Recent fixtures for a player's current club.
 * API-Football `/fixtures` has no `player` filter — Free plan uses `team` +
 * `season`, then we keep the most recent N (no paid `last`/`next`).
 */
export async function fetchRecentFixturesForPlayerClub(
  teamId: number,
  season: number,
  limit = 5,
): Promise<ApiFootballFixtureItem[]> {
  return fetchRecentFixturesByTeam(teamId, season, limit);
}

export async function fetchPlayerTrophies(
  playerId: number,
): Promise<ApiFootballTrophyItem[]> {
  const { data } = await apiFootballFetch<ApiFootballTrophyItem[]>(
    "/trophies",
    { player: playerId },
  );
  return data;
}
