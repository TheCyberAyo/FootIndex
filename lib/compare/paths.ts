import { isValidPlayerSlugFormat } from "@/lib/players/paths";

/**
 * Canonical compare URL per PROJECT_SPECIFICATION §83 / §67.
 */
export function comparePath(playerOneSlug: string, playerTwoSlug: string): string {
  return `/compare/${playerOneSlug}/${playerTwoSlug}`;
}

export function compareEntityId(
  playerOneSlug: string,
  playerTwoSlug: string,
): string {
  return [playerOneSlug, playerTwoSlug].sort().join("-vs-");
}

export function isValidCompareSlugPair(
  playerOne: string,
  playerTwo: string,
): boolean {
  return (
    isValidPlayerSlugFormat(playerOne) &&
    isValidPlayerSlugFormat(playerTwo) &&
    playerOne !== playerTwo
  );
}

/** Year/season compare + community vote remain on the featured rivalry pair. */
export function isFeaturedRivalryCompare(
  playerOneSlug: string,
  playerTwoSlug: string,
): boolean {
  const slugs = new Set([playerOneSlug, playerTwoSlug]);
  return slugs.has("haaland") && slugs.has("mbappe");
}

export const DEFAULT_COMPARE_SLUGS = {
  playerOne: "haaland",
  playerTwo: "mbappe",
} as const;

export function defaultComparePath(): string {
  return comparePath(
    DEFAULT_COMPARE_SLUGS.playerOne,
    DEFAULT_COMPARE_SLUGS.playerTwo,
  );
}

/** One canonical compare URL per unordered pair (lexicographic slug order). */
export function compareCanonicalPath(slugA: string, slugB: string): string {
  const [playerOne, playerTwo] = [slugA, slugB].sort();
  return comparePath(playerOne, playerTwo);
}
