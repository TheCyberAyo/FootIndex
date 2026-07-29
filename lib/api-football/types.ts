/**
 * Narrow interfaces for the API-Football payloads we consume.
 * Decision: hand-shaped types for only what we use — not the entire vendor schema.
 */

export interface ApiFootballPaging {
  current: number;
  total: number;
}

export interface ApiFootballEnvelope<T> {
  get: string;
  parameters: Record<string, string | number | undefined>;
  errors: Record<string, string> | string[] | [];
  results: number;
  paging: ApiFootballPaging;
  response: T;
}

export interface ApiFootballPlayerCore {
  id: number;
  name: string;
  firstname: string | null;
  lastname: string | null;
  age: number | null;
  birth: {
    date: string | null;
    place: string | null;
    country: string | null;
  };
  nationality: string | null;
  height: string | null;
  weight: string | null;
  injured: boolean;
  photo: string | null;
}

export interface ApiFootballTeamRef {
  id: number;
  name: string;
  logo: string | null;
}

export interface ApiFootballLeagueRef {
  id: number;
  name: string;
  country: string | null;
  logo: string | null;
  flag: string | null;
  season: number;
}

export interface ApiFootballPlayerStatistics {
  team: ApiFootballTeamRef;
  league: ApiFootballLeagueRef;
  games: {
    appearences: number | null;
    lineups: number | null;
    minutes: number | null;
    position: string | null;
    rating: string | null;
    captain: boolean;
  };
  goals: {
    total: number | null;
    assists: number | null;
  };
  cards: {
    yellow: number | null;
    red: number | null;
  };
}

export interface ApiFootballPlayerResponseItem {
  player: ApiFootballPlayerCore;
  statistics: ApiFootballPlayerStatistics[];
}

export interface ApiFootballFixtureTeam {
  id: number;
  name: string;
  logo: string | null;
  winner: boolean | null;
}

export interface ApiFootballFixtureItem {
  fixture: {
    id: number;
    timezone: string;
    date: string;
    timestamp: number;
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
    round: string | null;
  };
  teams: {
    home: ApiFootballFixtureTeam;
    away: ApiFootballFixtureTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface ApiFootballTrophyItem {
  league: string;
  country: string | null;
  season: string;
  place: string;
}

export interface ApiFootballRateLimitInfo {
  dailyRemaining: number | null;
  dailyLimit: number | null;
  minuteRemaining: number | null;
  minuteLimit: number | null;
}
