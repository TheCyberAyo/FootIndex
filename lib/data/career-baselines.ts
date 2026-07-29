/**
 * Curated senior career baselines (club first-team + senior international).
 *
 * Source of truth for Compare / career_stats until Pro multi-season sync lands.
 * Numbers exclude reserve/B-team matches (Bryne 2, Molde 2, Monaco II).
 *
 * Primary sources (as of 2026-07-25):
 * - Wikipedia career tables (Haaland club to 19 May 2026; intl to 11 Jul 2026)
 * - Wikipedia career tables (Mbappé club to 23 May 2026; intl to 18 Jul 2026)
 * - UEFA.com for Champions League goals (Haaland 57, Mbappé 70)
 *
 * Assists and minutes are curated estimates (not published as single Wikipedia totals).
 * Revisit after major tournaments / when upgrading API-Football to Pro.
 */

export const CAREER_BASELINE_AS_OF = "2026-07-25";

export interface CareerBaseline {
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  club_goals: number;
  international_goals: number;
  champions_league_goals: number;
  trophies_count: number;
  awards_count: number;
}

/** Haaland: club 380/297 + Norway 55/62; UCL 57. */
export const HAALAND_CAREER_BASELINE: CareerBaseline = {
  appearances: 435,
  goals: 359,
  assists: 68,
  minutes: 33500,
  club_goals: 297,
  international_goals: 62,
  champions_league_goals: 57,
  trophies_count: 12,
  awards_count: 14,
};

/** Mbappé: club 471/369 + France 106/66; UCL 70. */
export const MBAPPE_CAREER_BASELINE: CareerBaseline = {
  appearances: 577,
  goals: 435,
  assists: 152,
  minutes: 44800,
  club_goals: 369,
  international_goals: 66,
  champions_league_goals: 70,
  trophies_count: 20,
  awards_count: 18,
};

export function goalsPerGame(baseline: CareerBaseline): number {
  if (baseline.appearances <= 0) {
    return 0;
  }
  return Number((baseline.goals / baseline.appearances).toFixed(3));
}
