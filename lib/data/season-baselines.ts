/**
 * Curated club season baselines for year/season compare (Free plan).
 * Senior first-team only. Wikipedia club tables as of 2026-07-25.
 * International goals: see INTERNATIONAL_BY_YEAR (calendar year).
 */

export const SEASON_BASELINE_AS_OF = "2026-07-25";

export interface SeasonPlayerStats {
  club: string;
  appearances: number;
  goals: number;
}

export interface SeasonCompareRow {
  /** Display / URL key, e.g. "2022-2023" or "2017" (Norwegian calendar). */
  season: string;
  /** Years matched by search (e.g. 2022 and 2023). */
  years: number[];
  haaland: SeasonPlayerStats | null;
  mbappe: SeasonPlayerStats | null;
}

/** Newest first — primary list for /compare#by-year. */
export const SEASON_COMPARE_ROWS: SeasonCompareRow[] = [
  {
    season: "2025-2026",
    years: [2025, 2026],
    haaland: { club: "Manchester City", appearances: 52, goals: 38 },
    mbappe: { club: "Real Madrid", appearances: 44, goals: 42 },
  },
  {
    season: "2024-2025",
    years: [2024, 2025],
    haaland: { club: "Manchester City", appearances: 48, goals: 34 },
    mbappe: { club: "Real Madrid", appearances: 59, goals: 44 },
  },
  {
    season: "2023-2024",
    years: [2023, 2024],
    haaland: { club: "Manchester City", appearances: 45, goals: 38 },
    mbappe: { club: "Paris Saint-Germain", appearances: 48, goals: 44 },
  },
  {
    season: "2022-2023",
    years: [2022, 2023],
    haaland: { club: "Manchester City", appearances: 53, goals: 52 },
    mbappe: { club: "Paris Saint-Germain", appearances: 43, goals: 41 },
  },
  {
    season: "2021-2022",
    years: [2021, 2022],
    haaland: { club: "Borussia Dortmund", appearances: 30, goals: 29 },
    mbappe: { club: "Paris Saint-Germain", appearances: 46, goals: 39 },
  },
  {
    season: "2020-2021",
    years: [2020, 2021],
    haaland: { club: "Borussia Dortmund", appearances: 41, goals: 41 },
    mbappe: { club: "Paris Saint-Germain", appearances: 47, goals: 42 },
  },
  {
    season: "2019-2020",
    years: [2019, 2020],
    haaland: { club: "Salzburg / Dortmund", appearances: 40, goals: 44 },
    mbappe: { club: "Paris Saint-Germain", appearances: 37, goals: 30 },
  },
  {
    season: "2018-2019",
    years: [2018, 2019],
    haaland: { club: "Red Bull Salzburg", appearances: 5, goals: 1 },
    mbappe: { club: "Paris Saint-Germain", appearances: 43, goals: 39 },
  },
  {
    season: "2018",
    years: [2018],
    haaland: { club: "Molde", appearances: 30, goals: 16 },
    mbappe: null,
  },
  {
    season: "2017-2018",
    years: [2017, 2018],
    haaland: null,
    mbappe: { club: "Monaco / PSG", appearances: 46, goals: 21 },
  },
  {
    season: "2017",
    years: [2017],
    haaland: { club: "Molde", appearances: 20, goals: 4 },
    mbappe: null,
  },
  {
    season: "2016-2017",
    years: [2016, 2017],
    haaland: null,
    mbappe: { club: "AS Monaco", appearances: 44, goals: 26 },
  },
  {
    season: "2016",
    years: [2016],
    haaland: { club: "Bryne", appearances: 16, goals: 0 },
    mbappe: null,
  },
  {
    season: "2015-2016",
    years: [2015, 2016],
    haaland: null,
    mbappe: { club: "AS Monaco", appearances: 14, goals: 1 },
  },
];

/** Calendar-year senior international goal tallies. */
export const INTERNATIONAL_BY_YEAR: Record<
  number,
  { haaland: number; mbappe: number }
> = {
  2015: { haaland: 0, mbappe: 0 },
  2016: { haaland: 0, mbappe: 0 },
  2017: { haaland: 0, mbappe: 1 },
  2018: { haaland: 0, mbappe: 9 },
  2019: { haaland: 0, mbappe: 3 },
  2020: { haaland: 6, mbappe: 3 },
  2021: { haaland: 6, mbappe: 8 },
  2022: { haaland: 9, mbappe: 12 },
  2023: { haaland: 6, mbappe: 10 },
  2024: { haaland: 11, mbappe: 2 },
  2025: { haaland: 17, mbappe: 7 },
  2026: { haaland: 7, mbappe: 11 },
};
