import type {
  ApiFootballFixtureItem,
  ApiFootballPlayerCore,
  ApiFootballPlayerStatistics,
  ApiFootballTrophyItem,
} from "@/lib/api-football/types";
import type { MatchStatus, PlayerPosition } from "@/types/database";

export function parseHeightCm(height: string | null): number | null {
  if (!height) {
    return null;
  }
  const match = height.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function mapPosition(position: string | null): PlayerPosition {
  const normalized = (position ?? "").toLowerCase();
  if (normalized.includes("goalkeeper") || normalized === "gk") {
    return "GK";
  }
  if (normalized.includes("defender") || normalized === "df") {
    return "DF";
  }
  if (normalized.includes("midfielder") || normalized === "mf") {
    return "MF";
  }
  return "FW";
}

export function mapFixtureStatus(short: string): MatchStatus {
  const live = new Set([
    "1H",
    "2H",
    "HT",
    "ET",
    "BT",
    "P",
    "LIVE",
    "INT",
    "SUSP",
  ]);
  const finished = new Set(["FT", "AET", "PEN"]);
  const postponed = new Set(["PST", "PEV"]);
  const cancelled = new Set(["CANC", "ABD", "AWD", "WO"]);

  if (live.has(short)) {
    return "live";
  }
  if (finished.has(short)) {
    return "finished";
  }
  if (postponed.has(short)) {
    return "postponed";
  }
  if (cancelled.has(short)) {
    return "cancelled";
  }
  return "scheduled";
}

export function seasonLabel(season: number): string {
  return `${season}-${season + 1}`;
}

export function mapPlayerProfileUpdate(player: ApiFootballPlayerCore) {
  const height = parseHeightCm(player.height);
  return {
    name: `${player.firstname ?? ""} ${player.lastname ?? ""}`.trim() || player.name,
    short_name: player.name,
    date_of_birth: player.birth.date ?? "1990-01-01",
    nationality: player.nationality ?? "Unknown",
    height_cm: height && height > 0 ? height : 180,
    position: "FW" as const,
    bio: undefined as string | undefined,
    image_url: player.photo,
    api_football_id: player.id,
  };
}

export interface MappedSeasonStat {
  competition: string;
  season: string;
  teamApiId: number;
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  yellow_cards: number;
  red_cards: number;
}

export function mapSeasonStatistics(
  statistics: ApiFootballPlayerStatistics[],
  season: number,
): MappedSeasonStat[] {
  return statistics
    .filter((stat) => stat.league?.name)
    .map((stat) => ({
      competition: stat.league.name,
      season: seasonLabel(stat.league.season || season),
      teamApiId: stat.team.id,
      appearances: stat.games.appearences ?? 0,
      goals: stat.goals.total ?? 0,
      assists: stat.goals.assists ?? 0,
      minutes: stat.games.minutes ?? 0,
      yellow_cards: stat.cards.yellow ?? 0,
      red_cards: stat.cards.red ?? 0,
    }));
}

/**
 * Roll up season rows into career-shaped totals.
 * Kept for a future Pro multi-season sync — Free-plan sync must not call this
 * to overwrite curated `career_stats` baselines.
 */
export function aggregateCareerFromSeasonStats(
  rows: Array<{
    appearances: number;
    goals: number;
    assists: number;
    minutes: number;
    competition: string;
  }>,
) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.appearances += row.appearances;
      acc.goals += row.goals;
      acc.assists += row.assists;
      acc.minutes += row.minutes;
      const competition = row.competition.toLowerCase();
      if (
        competition.includes("world cup") ||
        competition.includes("euro") ||
        competition.includes("nations") ||
        competition.includes("international") ||
        competition.includes("qualif")
      ) {
        acc.international_goals += row.goals;
      } else {
        acc.club_goals += row.goals;
      }
      if (competition.includes("champions league")) {
        acc.champions_league_goals += row.goals;
      }
      return acc;
    },
    {
      appearances: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
      club_goals: 0,
      international_goals: 0,
      champions_league_goals: 0,
    },
  );

  return totals;
}

export function mapFixture(item: ApiFootballFixtureItem) {
  return {
    api_football_id: item.fixture.id,
    competition: item.league.name,
    season: seasonLabel(item.league.season),
    kickoff_at: item.fixture.date,
    status: mapFixtureStatus(item.fixture.status.short),
    home_score: item.goals.home,
    away_score: item.goals.away,
    venue: item.fixture.venue.name,
    home_team_api_id: item.teams.home.id,
    away_team_api_id: item.teams.away.id,
    home_team_name: item.teams.home.name,
    away_team_name: item.teams.away.name,
    home_team_logo: item.teams.home.logo,
    away_team_logo: item.teams.away.logo,
  };
}

export function mapTrophy(
  item: ApiFootballTrophyItem,
): { name: string; season: string | null; year: number } | null {
  if (!item.league) {
    return null;
  }
  // API returns place like "Winner" / "2nd Place" — only keep winners for trophies table
  if (!/winner/i.test(item.place ?? "")) {
    return null;
  }

  const yearMatch = item.season?.match(/(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();

  return {
    name: item.league,
    season: item.season || null,
    year,
  };
}

export function mapPositionFromStats(
  statistics: ApiFootballPlayerStatistics[],
): PlayerPosition {
  const first = statistics[0]?.games.position ?? null;
  return mapPosition(first);
}
