export type MetricWinner = "haaland" | "mbappe" | "tie";

export type MetricFormat = "integer" | "decimal";

export interface CompareMetricDefinition {
  key: string;
  label: string;
  format: MetricFormat;
}

export interface CompareMetric extends CompareMetricDefinition {
  haalandValue: number;
  mbappeValue: number;
  winner: MetricWinner;
  delta: number;
}

export interface CompareScoreboard {
  haalandWins: number;
  mbappeWins: number;
  ties: number;
}

export interface CompareResult {
  metrics: CompareMetric[];
  scoreboard: CompareScoreboard;
}
