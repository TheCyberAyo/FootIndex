import { FEATURED_RIVALRY } from "@/lib/brand/featured-rivalry";

/** Slugs with hand-curated career baselines — sync must not overwrite. */
export const CURATED_CAREER_SLUGS = new Set<string>([
  FEATURED_RIVALRY.playerOneSlug,
  FEATURED_RIVALRY.playerTwoSlug,
]);

export function hasCuratedCareer(slug: string): boolean {
  return CURATED_CAREER_SLUGS.has(slug);
}
