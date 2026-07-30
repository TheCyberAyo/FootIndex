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
  replaceComparePlayerPath,
  compareEntityId,
  isValidCompareSlugPair,
  isFeaturedRivalryCompare,
  defaultComparePath,
  DEFAULT_COMPARE_SLUGS,
} from "@/lib/compare/paths";

export {
  buildDynamicSeasonRows,
  filterDynamicSeasonsByQuery,
  resolveDynamicSeasonKey,
  searchDynamicYearCompare,
  buildDynamicSeasonCompareMetrics,
  buildDynamicInternationalYearMetrics,
  formatDynamicSeasonClub,
  buildSeasonCompareShareUrl,
} from "@/lib/compare/season-compare";

export { buildComparisonSummary } from "@/lib/compare/summary";
