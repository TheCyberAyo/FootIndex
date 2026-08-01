import type { CompareMetric } from "@/lib/compare";
import type { CareerStats, PlayerProfile, SeasonStats } from "@/types/domain";

export interface RadarPoint {
  metric: string;
  playerOne: number;
  playerTwo: number;
  fullMark: number;
}

export interface BarPoint {
  metric: string;
  playerOne: number;
  playerTwo: number;
}

export interface PieSlice {
  key: string;
  name: string;
  value: number;
}

export interface SeasonProgressPoint {
  season: string;
  goals: number;
  assists: number;
}

export interface DualSeasonProgressPoint {
  season: string;
  playerOne: number;
  playerTwo: number;
}

const RADAR_KEYS = [
  "goals",
  "assists",
  "appearances",
  "goals_per_game",
  "champions_league_goals",
  "trophies",
] as const;

const BAR_KEYS = [
  "goals",
  "assists",
  "appearances",
  "champions_league_goals",
  "trophies",
  "awards",
] as const;

function normalizePair(
  a: number | null,
  b: number | null,
): { a: number; b: number } {
  const left = a ?? 0;
  const right = b ?? 0;
  const max = Math.max(left, right, 0);
  if (max <= 0) {
    return { a: 0, b: 0 };
  }
  return {
    a: Math.round((left / max) * 100),
    b: Math.round((right / max) * 100),
  };
}

/**
 * Radar uses 0–100 relative scores so goals and goals/game share one scale.
 */
export function buildRadarSeries(metrics: CompareMetric[]): RadarPoint[] {
  return metrics
    .filter((metric) =>
      (RADAR_KEYS as readonly string[]).includes(metric.key),
    )
    .map((metric) => {
      const normalized = normalizePair(
        metric.playerOneValue,
        metric.playerTwoValue,
      );
      return {
        metric: metric.label,
        playerOne: normalized.a,
        playerTwo: normalized.b,
        fullMark: 100,
      };
    });
}

export function buildBarSeries(metrics: CompareMetric[]): BarPoint[] {
  return metrics
    .filter((metric) => (BAR_KEYS as readonly string[]).includes(metric.key))
    .map((metric) => ({
      metric: metric.label.replace("Champions League Goals", "UCL Goals"),
      playerOne: metric.playerOneValue ?? 0,
      playerTwo: metric.playerTwoValue ?? 0,
    }));
}

export function buildGoalsPie(career: CareerStats | null): PieSlice[] {
  const club = career?.club_goals ?? 0;
  const international = career?.international_goals ?? 0;

  if (club === 0 && international === 0) {
    return [];
  }

  return [
    { key: "club", name: "Club", value: club },
    { key: "international", name: "International", value: international },
  ];
}

/**
 * Sum competition rows into one goals/assists line per season label.
 */
export function buildSeasonProgression(
  seasons: SeasonStats[],
): SeasonProgressPoint[] {
  const bySeason = new Map<string, SeasonProgressPoint>();

  for (const row of seasons) {
    const current = bySeason.get(row.season) ?? {
      season: row.season,
      goals: 0,
      assists: 0,
    };
    current.goals += row.goals;
    current.assists += row.assists;
    bySeason.set(row.season, current);
  }

  return Array.from(bySeason.values()).sort((a, b) =>
    a.season.localeCompare(b.season),
  );
}

export function buildDualSeasonGoals(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
): DualSeasonProgressPoint[] {
  const playerOneBySeason = new Map(
    buildSeasonProgression(playerOne.seasons).map((point) => [
      point.season,
      point.goals,
    ]),
  );
  const playerTwoBySeason = new Map(
    buildSeasonProgression(playerTwo.seasons).map((point) => [
      point.season,
      point.goals,
    ]),
  );

  const seasons = Array.from(
    new Set([...playerOneBySeason.keys(), ...playerTwoBySeason.keys()]),
  ).sort((a, b) => a.localeCompare(b));

  return seasons.map((season) => ({
    season,
    playerOne: playerOneBySeason.get(season) ?? 0,
    playerTwo: playerTwoBySeason.get(season) ?? 0,
  }));
}
