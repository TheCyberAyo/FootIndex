import { CAREER_BASELINE_AS_OF } from "@/lib/data/career-baselines";
import { hasCuratedCareer } from "@/lib/players/curated";
import { listCuratedPlayerSlugs } from "@/lib/seo/prerender";
import type { PlayerProfile } from "@/types/domain";

/** Minimum distinct synced seasons before we publish career head-to-head scores. */
export const COMPARE_MIN_SYNCED_SEASONS = 2;

export type CompareDataTier = "curated" | "synced" | "partial" | "missing";

const PICKER_ELIGIBLE_SLUGS = new Set(listCuratedPlayerSlugs());

export function countDistinctSeasons(profile: PlayerProfile): number {
  return new Set(profile.seasons.map((row) => row.season)).size;
}

export function getCompareDataTier(profile: PlayerProfile): CompareDataTier {
  if (hasCuratedCareer(profile.player.slug)) {
    return "curated";
  }

  if (!profile.career) {
    return "missing";
  }

  const seasons = countDistinctSeasons(profile);
  if (seasons >= COMPARE_MIN_SYNCED_SEASONS) {
    return "synced";
  }

  return seasons >= 1 ? "partial" : "partial";
}

export function isCompareReady(profile: PlayerProfile): boolean {
  const tier = getCompareDataTier(profile);
  return tier === "curated" || tier === "synced";
}

export function isComparePairReady(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
): boolean {
  return isCompareReady(playerOne) && isCompareReady(playerTwo);
}

export function isComparePickerEligible(slug: string): boolean {
  return PICKER_ELIGIBLE_SLUGS.has(slug);
}

export function describeCompareDataTier(profile: PlayerProfile): string {
  const tier = getCompareDataTier(profile);
  const name = profile.player.short_name;

  switch (tier) {
    case "curated":
      return `${name} uses a verified career baseline (as of ${CAREER_BASELINE_AS_OF}).`;
    case "synced":
      return `${name} career totals roll up from ${countDistinctSeasons(profile)} synced seasons.`;
    case "partial":
      if (!profile.career) {
        return `${name} has no synced career stats yet.`;
      }
      return `${name} only has ${countDistinctSeasons(profile)} synced season(s) — not enough for a full career comparison.`;
    case "missing":
      return `${name} has no synced career stats yet.`;
  }
}

export interface ComparePairReadiness {
  pairReady: boolean;
  playerOneTier: CompareDataTier;
  playerTwoTier: CompareDataTier;
  playerOneReady: boolean;
  playerTwoReady: boolean;
}

export function assessComparePair(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
): ComparePairReadiness {
  const playerOneTier = getCompareDataTier(playerOne);
  const playerTwoTier = getCompareDataTier(playerTwo);
  const playerOneReady = isCompareReady(playerOne);
  const playerTwoReady = isCompareReady(playerTwo);

  return {
    pairReady: playerOneReady && playerTwoReady,
    playerOneTier,
    playerTwoTier,
    playerOneReady,
    playerTwoReady,
  };
}
