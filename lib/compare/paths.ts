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

/** Featured rivalry — marketing default; compare features work for all pairs. */
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

/**
 * Build canonical compare URL after swapping one side.
 * Returns null when the new slug matches an existing side (no-op / invalid).
 */
export function replaceComparePlayerPath(
  currentPlayerOneSlug: string,
  currentPlayerTwoSlug: string,
  side: "playerOne" | "playerTwo",
  newSlug: string,
): string | null {
  if (
    newSlug === currentPlayerOneSlug ||
    newSlug === currentPlayerTwoSlug
  ) {
    return null;
  }

  const nextOne =
    side === "playerOne" ? newSlug : currentPlayerOneSlug;
  const nextTwo =
    side === "playerTwo" ? newSlug : currentPlayerTwoSlug;

  return compareCanonicalPath(nextOne, nextTwo);
}
