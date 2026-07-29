export type {
  MetricWinner,
  MetricFormat,
  CompareMetricDefinition,
  CompareMetric,
  CompareScoreboard,
  CompareResult,
} from "@/lib/compare/types";

export {
  COMPARE_METRIC_DEFINITIONS,
  decideWinner,
  formatCompareValue,
  buildCompareMetrics,
  buildScoreboard,
  buildComparison,
} from "@/lib/compare/engine";

export {
  comparePath,
  compareCanonicalPath,
  compareEntityId,
  isValidCompareSlugPair,
  isFeaturedRivalryCompare,
  defaultComparePath,
  DEFAULT_COMPARE_SLUGS,
} from "@/lib/compare/paths";

export {
  filterSeasonsByQuery,
  resolveSeasonKey,
  getSeasonRow,
  searchYearCompare,
  buildSeasonCompareMetrics,
  buildInternationalYearMetrics,
  formatSeasonClub,
  SEASON_COMPARE_ROWS,
} from "@/lib/compare/by-year";
