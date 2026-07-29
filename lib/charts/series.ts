import type { CompareMetric } from "@/lib/compare";
import type { CareerStats, PlayerProfile, SeasonStats } from "@/types/domain";

export interface RadarPoint {
  metric: string;
  haaland: number;
  mbappe: number;
  fullMark: number;
}

export interface BarPoint {
  metric: string;
  haaland: number;
  mbappe: number;
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
  haaland: number;
  mbappe: number;
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

function normalizePair(a: number, b: number): { a: number; b: number } {
  const max = Math.max(a, b, 0);
  if (max <= 0) {
    return { a: 0, b: 0 };
  }
  return {
    a: Math.round((a / max) * 100),
    b: Math.round((b / max) * 100),
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
        metric.haalandValue,
        metric.mbappeValue,
      );
      return {
        metric: metric.label,
        haaland: normalized.a,
        mbappe: normalized.b,
        fullMark: 100,
      };
    });
}

export function buildBarSeries(metrics: CompareMetric[]): BarPoint[] {
  return metrics
    .filter((metric) => (BAR_KEYS as readonly string[]).includes(metric.key))
    .map((metric) => ({
      metric: metric.label.replace("Champions League Goals", "UCL Goals"),
      haaland: metric.haalandValue,
      mbappe: metric.mbappeValue,
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
  haaland: PlayerProfile,
  mbappe: PlayerProfile,
): DualSeasonProgressPoint[] {
  const haalandBySeason = new Map(
    buildSeasonProgression(haaland.seasons).map((point) => [
      point.season,
      point.goals,
    ]),
  );
  const mbappeBySeason = new Map(
    buildSeasonProgression(mbappe.seasons).map((point) => [
      point.season,
      point.goals,
    ]),
  );

  const seasons = Array.from(
    new Set([...haalandBySeason.keys(), ...mbappeBySeason.keys()]),
  ).sort((a, b) => a.localeCompare(b));

  return seasons.map((season) => ({
    season,
    haaland: haalandBySeason.get(season) ?? 0,
    mbappe: mbappeBySeason.get(season) ?? 0,
  }));
}
