import type { PlayerProfile } from "@/types/domain";

import type {
  CompareMetric,
  CompareMetricDefinition,
  CompareResult,
  CompareScoreboard,
  MetricFormat,
  MetricWinner,
} from "@/lib/compare/types";

/**
 * Pure comparison engine — no I/O, no React.
 * Decision: keep winner/delta logic testable and reusable (home preview + /compare).
 */

export const COMPARE_METRIC_DEFINITIONS: CompareMetricDefinition[] = [
  { key: "goals", label: "Career Goals", format: "integer" },
  { key: "assists", label: "Assists", format: "integer" },
  { key: "appearances", label: "Appearances", format: "integer" },
  { key: "minutes", label: "Minutes", format: "integer" },
  { key: "goals_per_game", label: "Goals Per Game", format: "decimal" },
  { key: "club_goals", label: "Club Goals", format: "integer" },
  {
    key: "international_goals",
    label: "International Goals",
    format: "integer",
  },
  {
    key: "champions_league_goals",
    label: "Champions League Goals",
    format: "integer",
  },
  { key: "trophies", label: "Trophies", format: "integer" },
  { key: "awards", label: "Awards", format: "integer" },
];

export function decideWinner(
  haalandValue: number,
  mbappeValue: number,
): MetricWinner {
  if (haalandValue > mbappeValue) {
    return "haaland";
  }
  if (mbappeValue > haalandValue) {
    return "mbappe";
  }
  return "tie";
}

export function formatCompareValue(
  value: number,
  format: MetricFormat,
): string {
  if (format === "decimal") {
    return value.toFixed(3);
  }
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function readMetricValue(profile: PlayerProfile, key: string): number {
  const career = profile.career;

  switch (key) {
    case "goals":
      return career?.goals ?? 0;
    case "assists":
      return career?.assists ?? 0;
    case "appearances":
      return career?.appearances ?? 0;
    case "minutes":
      return career?.minutes ?? 0;
    case "goals_per_game":
      return Number(career?.goals_per_game ?? 0);
    case "club_goals":
      return career?.club_goals ?? 0;
    case "international_goals":
      return career?.international_goals ?? 0;
    case "champions_league_goals":
      return career?.champions_league_goals ?? 0;
    case "trophies":
      return Math.max(
        career?.trophies_count ?? 0,
        profile.trophies.length,
      );
    case "awards":
      return Math.max(career?.awards_count ?? 0, profile.awards.length);
    default:
      return 0;
  }
}

export function buildCompareMetrics(
  haaland: PlayerProfile,
  mbappe: PlayerProfile,
): CompareMetric[] {
  return COMPARE_METRIC_DEFINITIONS.map((definition) => {
    const haalandValue = readMetricValue(haaland, definition.key);
    const mbappeValue = readMetricValue(mbappe, definition.key);

    return {
      ...definition,
      haalandValue,
      mbappeValue,
      winner: decideWinner(haalandValue, mbappeValue),
      delta: Math.abs(haalandValue - mbappeValue),
    };
  });
}

export function buildScoreboard(metrics: CompareMetric[]): CompareScoreboard {
  return metrics.reduce<CompareScoreboard>(
    (acc, metric) => {
      if (metric.winner === "haaland") {
        acc.haalandWins += 1;
      } else if (metric.winner === "mbappe") {
        acc.mbappeWins += 1;
      } else {
        acc.ties += 1;
      }
      return acc;
    },
    { haalandWins: 0, mbappeWins: 0, ties: 0 },
  );
}

export function buildComparison(
  haaland: PlayerProfile,
  mbappe: PlayerProfile,
): CompareResult {
  const metrics = buildCompareMetrics(haaland, mbappe);
  return {
    metrics,
    scoreboard: buildScoreboard(metrics),
  };
}
