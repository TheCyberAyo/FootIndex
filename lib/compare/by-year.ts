import {
  INTERNATIONAL_BY_YEAR,
  SEASON_COMPARE_ROWS,
  type SeasonCompareRow,
  type SeasonPlayerStats,
} from "@/lib/data/season-baselines";
import { decideWinner, formatCompareValue } from "@/lib/compare/engine";
import type { CompareMetric, MetricWinner } from "@/lib/compare/types";

export interface YearSearchResult {
  seasons: SeasonCompareRow[];
  /** Exact calendar year when query is a 4-digit year. */
  calendarYear: number | null;
  international: { haaland: number; mbappe: number } | null;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/[–—]/g, "-");
}

/** Match "2023", "22-23", "2022-2023", "dortmund", etc. */
export function filterSeasonsByQuery(query: string): SeasonCompareRow[] {
  const q = normalizeQuery(query);
  if (!q) {
    return SEASON_COMPARE_ROWS;
  }

  if (/^(19|20)\d{2}$/.test(q)) {
    const year = Number(q);
    return SEASON_COMPARE_ROWS.filter((row) => row.years.includes(year));
  }

  const compact = q.replace(/-/g, "");

  return SEASON_COMPARE_ROWS.filter((row) => {
    const haystack = [
      row.season,
      ...row.years.map(String),
      row.haaland?.club ?? "",
      row.mbappe?.club ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q) || haystack.replace(/-/g, "").includes(compact);
  });
}

export function resolveSeasonKey(
  seasonParam: string | null | undefined,
  yearParam: string | null | undefined,
): string {
  if (seasonParam) {
    const normalized = seasonParam.replace(/[–—]/g, "-");
    const exact = SEASON_COMPARE_ROWS.find((row) => row.season === normalized);
    if (exact) {
      return exact.season;
    }
  }

  if (yearParam && /^(19|20)\d{2}$/.test(yearParam)) {
    const year = Number(yearParam);
    const match = SEASON_COMPARE_ROWS.find((row) => row.years.includes(year));
    if (match) {
      return match.season;
    }
  }

  return SEASON_COMPARE_ROWS[0]?.season ?? "2025-2026";
}

export function getSeasonRow(season: string): SeasonCompareRow | null {
  return SEASON_COMPARE_ROWS.find((row) => row.season === season) ?? null;
}

export function searchYearCompare(query: string): YearSearchResult {
  const seasons = filterSeasonsByQuery(query);
  const q = normalizeQuery(query);
  const calendarYear = /^(19|20)\d{2}$/.test(q) ? Number(q) : null;
  const international =
    calendarYear != null
      ? (INTERNATIONAL_BY_YEAR[calendarYear] ?? { haaland: 0, mbappe: 0 })
      : null;

  return { seasons, calendarYear, international };
}

function metricFromPair(
  key: string,
  label: string,
  haalandValue: number | null,
  mbappeValue: number | null,
): CompareMetric {
  const playerOneValue = haalandValue ?? 0;
  const playerTwoValue = mbappeValue ?? 0;
  let winner: MetricWinner = "tie";
  if (haalandValue == null && mbappeValue == null) {
    winner = "tie";
  } else if (haalandValue == null) {
    winner = mbappeValue != null && mbappeValue > 0 ? "playerTwo" : "tie";
  } else if (mbappeValue == null) {
    winner = haalandValue > 0 ? "playerOne" : "tie";
  } else {
    winner = decideWinner(playerOneValue, playerTwoValue);
  }

  return {
    key,
    label,
    format: "integer",
    playerOneValue,
    playerTwoValue,
    winner,
    delta: Math.abs(playerOneValue - playerTwoValue),
  };
}

export function buildSeasonCompareMetrics(
  row: SeasonCompareRow,
): CompareMetric[] {
  const read = (
    side: SeasonPlayerStats | null,
    key: "appearances" | "goals",
  ): number | null => (side ? side[key] : null);

  return [
    metricFromPair(
      "club_goals",
      "Club Goals",
      read(row.haaland, "goals"),
      read(row.mbappe, "goals"),
    ),
    metricFromPair(
      "appearances",
      "Club Appearances",
      read(row.haaland, "appearances"),
      read(row.mbappe, "appearances"),
    ),
  ];
}

export function buildInternationalYearMetrics(year: number): CompareMetric[] {
  const row = INTERNATIONAL_BY_YEAR[year] ?? { haaland: 0, mbappe: 0 };
  return [
    metricFromPair(
      "intl_goals",
      `International Goals (${year})`,
      row.haaland,
      row.mbappe,
    ),
  ];
}

export function formatSeasonClub(stats: SeasonPlayerStats | null): string {
  if (!stats) {
    return "No senior club season";
  }
  return `${stats.club} · ${formatCompareValue(stats.goals, "integer")} in ${formatCompareValue(stats.appearances, "integer")}`;
}

export { SEASON_COMPARE_ROWS };
