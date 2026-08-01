export type MetricWinner = "playerOne" | "playerTwo" | "tie";

export type MetricFormat = "integer" | "decimal";

export interface CompareMetricDefinition {
  key: string;
  label: string;
  format: MetricFormat;
}

export interface CompareMetric extends CompareMetricDefinition {
  playerOneValue: number | null;
  playerTwoValue: number | null;
  winner: MetricWinner;
  delta: number | null;
}

export interface CompareScoreboard {
  playerOneWins: number;
  playerTwoWins: number;
  ties: number;
}

export interface CompareResult {
  metrics: CompareMetric[];
  scoreboard: CompareScoreboard;
}
