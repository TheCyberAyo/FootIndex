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
  playerOneValue: number | null,
  playerTwoValue: number | null,
): MetricWinner {
  if (playerOneValue == null || playerTwoValue == null) {
    return "tie";
  }

  if (playerOneValue > playerTwoValue) {
    return "playerOne";
  }
  if (playerTwoValue > playerOneValue) {
    return "playerTwo";
  }
  return "tie";
}

export function formatCompareValue(
  value: number | null | undefined,
  format: MetricFormat,
): string {
  if (value == null) {
    return "—";
  }

  if (format === "decimal") {
    return value.toFixed(3);
  }
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function readMetricValue(profile: PlayerProfile, key: string): number | null {
  const career = profile.career;
  if (!career) {
    return null;
  }

  switch (key) {
    case "goals":
      return career.goals;
    case "assists":
      return career.assists;
    case "appearances":
      return career.appearances;
    case "minutes":
      return career.minutes;
    case "goals_per_game":
      return Number(career.goals_per_game);
    case "club_goals":
      return career.club_goals;
    case "international_goals":
      return career.international_goals;
    case "champions_league_goals":
      return career.champions_league_goals;
    case "trophies":
      return Math.max(career.trophies_count, profile.trophies.length);
    case "awards":
      return Math.max(career.awards_count, profile.awards.length);
    default:
      return null;
  }
}

export function buildCompareMetrics(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
): CompareMetric[] {
  return COMPARE_METRIC_DEFINITIONS.map((definition) => {
    const playerOneValue = readMetricValue(playerOne, definition.key);
    const playerTwoValue = readMetricValue(playerTwo, definition.key);

    const winner = decideWinner(playerOneValue, playerTwoValue);
    const delta =
      playerOneValue != null && playerTwoValue != null
        ? Math.abs(playerOneValue - playerTwoValue)
        : null;

    return {
      ...definition,
      playerOneValue,
      playerTwoValue,
      winner,
      delta,
    };
  });
}

export function buildScoreboard(metrics: CompareMetric[]): CompareScoreboard {
  return metrics.reduce<CompareScoreboard>(
    (acc, metric) => {
      if (metric.playerOneValue == null || metric.playerTwoValue == null) {
        return acc;
      }

      if (metric.winner === "playerOne") {
        acc.playerOneWins += 1;
      } else if (metric.winner === "playerTwo") {
        acc.playerTwoWins += 1;
      } else {
        acc.ties += 1;
      }
      return acc;
    },
    { playerOneWins: 0, playerTwoWins: 0, ties: 0 },
  );
}

export function buildComparison(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
): CompareResult {
  const metrics = buildCompareMetrics(playerOne, playerTwo);
  return {
    metrics,
    scoreboard: buildScoreboard(metrics),
  };
}
