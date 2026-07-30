/**
 * Verified API-Football IDs for seed/sync targets.
 * Free plan: seasons 2022–2024 — default sync season is 2024.
 */

export const API_FOOTBALL_PLAYERS = {
  haaland: {
    slug: "haaland",
    apiId: 1100,
    teamApiId: 50,
  },
  mbappe: {
    slug: "mbappe",
    apiId: 278,
    teamApiId: 541,
  },
} as const;

export const API_FOOTBALL_TEAMS = {
  manchesterCity: 50,
  realMadrid: 541,
} as const;

export const DEFAULT_SYNC_SEASON = 2024;

/** Most recent player appearances shown on the site (and fetched per sync). */
export const RECENT_MATCHES_PER_PLAYER = 5;

export const TRACKED_TEAM_API_IDS = [
  API_FOOTBALL_TEAMS.manchesterCity,
  API_FOOTBALL_TEAMS.realMadrid,
] as const;

export type TrackedPlayerKey = keyof typeof API_FOOTBALL_PLAYERS;
