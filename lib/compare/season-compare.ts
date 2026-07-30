import { decideWinner } from "@/lib/compare/engine";
import type { CompareMetric, MetricWinner } from "@/lib/compare/types";
import type { PlayerProfile, SeasonStats } from "@/types/domain";

export interface SeasonSideStats {
  club: string;
  appearances: number;
  goals: number;
  assists: number;
}

export interface DynamicSeasonCompareRow {
  season: string;
  years: number[];
  playerOne: SeasonSideStats | null;
  playerTwo: SeasonSideStats | null;
}

export interface DynamicYearSearchResult {
  seasons: DynamicSeasonCompareRow[];
  calendarYear: number | null;
  international: { playerOne: number; playerTwo: number } | null;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/[–—]/g, "-");
}

function seasonStartYear(label: string): number {
  const match = label.match(/^(\d{4})/);
  return match ? Number(match[1]) : 0;
}

function isClubSeason(season: SeasonStats): boolean {
  return season.team?.team_type !== "national";
}

function aggregateClubSeasons(
  seasons: SeasonStats[],
): Map<string, SeasonSideStats> {
  const map = new Map<string, SeasonSideStats>();

  for (const row of seasons.filter(isClubSeason)) {
    const current = map.get(row.season) ?? {
      club: row.team?.short_name ?? row.team?.name ?? row.competition,
      appearances: 0,
      goals: 0,
      assists: 0,
    };

    map.set(row.season, {
      club:
        current.club ||
        row.team?.short_name ||
        row.team?.name ||
        row.competition,
      appearances: current.appearances + row.appearances,
      goals: current.goals + row.goals,
      assists: current.assists + row.assists,
    });
  }

  return map;
}

function aggregateInternationalByYear(
  seasons: SeasonStats[],
): Map<number, number> {
  const map = new Map<number, number>();

  for (const row of seasons) {
    if (row.team?.team_type !== "national") {
      continue;
    }
    const year = seasonStartYear(row.season);
    if (year <= 0) {
      continue;
    }
    map.set(year, (map.get(year) ?? 0) + row.goals);
  }

  return map;
}

export function buildDynamicSeasonRows(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
): DynamicSeasonCompareRow[] {
  const one = aggregateClubSeasons(playerOne.seasons);
  const two = aggregateClubSeasons(playerTwo.seasons);
  const labels = new Set([...one.keys(), ...two.keys()]);

  return [...labels]
    .map((season) => ({
      season,
      years: [seasonStartYear(season)].filter((year) => year > 0),
      playerOne: one.get(season) ?? null,
      playerTwo: two.get(season) ?? null,
    }))
    .sort((a, b) => b.season.localeCompare(a.season));
}

export function filterDynamicSeasonsByQuery(
  rows: DynamicSeasonCompareRow[],
  query: string,
): DynamicSeasonCompareRow[] {
  const q = normalizeQuery(query);
  if (!q) {
    return rows;
  }

  if (/^(19|20)\d{2}$/.test(q)) {
    const year = Number(q);
    return rows.filter((row) => row.years.includes(year));
  }

  const compact = q.replace(/-/g, "");

  return rows.filter((row) => {
    const haystack = [
      row.season,
      ...row.years.map(String),
      row.playerOne?.club ?? "",
      row.playerTwo?.club ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q) || haystack.replace(/-/g, "").includes(compact);
  });
}

export function resolveDynamicSeasonKey(
  rows: DynamicSeasonCompareRow[],
  seasonParam: string | null | undefined,
  yearParam: string | null | undefined,
): string {
  if (seasonParam) {
    const normalized = seasonParam.replace(/[–—]/g, "-");
    const exact = rows.find((row) => row.season === normalized);
    if (exact) {
      return exact.season;
    }
  }

  if (yearParam && /^(19|20)\d{2}$/.test(yearParam)) {
    const year = Number(yearParam);
    const match = rows.find((row) => row.years.includes(year));
    if (match) {
      return match.season;
    }
  }

  return rows[0]?.season ?? "";
}

export function searchDynamicYearCompare(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
  query: string,
): DynamicYearSearchResult {
  const allRows = buildDynamicSeasonRows(playerOne, playerTwo);
  const seasons = filterDynamicSeasonsByQuery(allRows, query);
  const q = normalizeQuery(query);
  const calendarYear = /^(19|20)\d{2}$/.test(q) ? Number(q) : null;

  const intlOne = aggregateInternationalByYear(playerOne.seasons);
  const intlTwo = aggregateInternationalByYear(playerTwo.seasons);

  const international =
    calendarYear != null
      ? {
          playerOne: intlOne.get(calendarYear) ?? 0,
          playerTwo: intlTwo.get(calendarYear) ?? 0,
        }
      : null;

  return { seasons, calendarYear, international };
}

function metricFromPair(
  key: string,
  label: string,
  playerOneValue: number | null,
  playerTwoValue: number | null,
): CompareMetric {
  const left = playerOneValue ?? 0;
  const right = playerTwoValue ?? 0;
  let winner: MetricWinner = "tie";

  if (playerOneValue == null && playerTwoValue == null) {
    winner = "tie";
  } else if (playerOneValue == null) {
    winner = playerTwoValue != null && playerTwoValue > 0 ? "playerTwo" : "tie";
  } else if (playerTwoValue == null) {
    winner = playerOneValue > 0 ? "playerOne" : "tie";
  } else {
    winner = decideWinner(left, right);
  }

  return {
    key,
    label,
    format: "integer",
    playerOneValue: left,
    playerTwoValue: right,
    winner,
    delta: Math.abs(left - right),
  };
}

export function buildDynamicSeasonCompareMetrics(
  row: DynamicSeasonCompareRow,
): CompareMetric[] {
  const read = (
    side: SeasonSideStats | null,
    key: "appearances" | "goals" | "assists",
  ): number | null => (side ? side[key] : null);

  return [
    metricFromPair(
      "club_goals",
      "Club goals",
      read(row.playerOne, "goals"),
      read(row.playerTwo, "goals"),
    ),
    metricFromPair(
      "club_assists",
      "Club assists",
      read(row.playerOne, "assists"),
      read(row.playerTwo, "assists"),
    ),
    metricFromPair(
      "appearances",
      "Club appearances",
      read(row.playerOne, "appearances"),
      read(row.playerTwo, "appearances"),
    ),
  ];
}

export function buildDynamicInternationalYearMetrics(
  year: number,
  playerOneGoals: number,
  playerTwoGoals: number,
): CompareMetric[] {
  return [
    metricFromPair(
      "intl_goals",
      `International goals (${year})`,
      playerOneGoals,
      playerTwoGoals,
    ),
  ];
}

export function formatDynamicSeasonClub(stats: SeasonSideStats | null): string {
  if (!stats) {
    return "No club season on record";
  }
  return `${stats.club} · ${stats.goals}G / ${stats.appearances} apps`;
}

export function buildSeasonCompareShareUrl(
  comparePath: string,
  season: string,
  year?: string | null,
): string {
  const params = new URLSearchParams({ season });
  if (year && /^(19|20)\d{2}$/.test(year)) {
    params.set("year", year);
  }
  return `${comparePath}?${params.toString()}#by-year`;
}
