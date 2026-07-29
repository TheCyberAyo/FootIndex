export type MetricWinner = "playerOne" | "playerTwo" | "tie";

export type MetricFormat = "integer" | "decimal";

export interface CompareMetricDefinition {
  key: string;
  label: string;
  format: MetricFormat;
}

export interface CompareMetric extends CompareMetricDefinition {
  playerOneValue: number;
  playerTwoValue: number;
  winner: MetricWinner;
  delta: number;
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
