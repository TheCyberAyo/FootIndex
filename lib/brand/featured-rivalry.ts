import { comparePath } from "@/lib/compare/paths";

/** Featured head-to-head — marketing anchor; compare extras are available for all pairs. */
export const FEATURED_RIVALRY = {
  playerOneSlug: "haaland",
  playerTwoSlug: "mbappe",
  playerOneShortName: "Haaland",
  playerTwoShortName: "Mbappé",
  title: "Haaland vs Mbappé",
  description:
    "Erling Haaland and Kylian Mbappé — career goals, club vs country, trophies, and season-by-season stats.",
} as const;

export function featuredComparePath(): string {
  return comparePath(
    FEATURED_RIVALRY.playerOneSlug,
    FEATURED_RIVALRY.playerTwoSlug,
  );
}
