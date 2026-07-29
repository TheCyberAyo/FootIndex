import { getPlayerProfileBySlug, listPlayers } from "@/services";
import type { PlayerProfile } from "@/types/domain";

/** Preserves Haaland ↔ Mbappé radar UX until compare is generalised. */
const FEATURED_RIVAL: Record<string, string> = {
  haaland: "mbappe",
  mbappe: "haaland",
};

/**
 * Loads a comparison partner for player-page charts.
 * Returns null when no other player exists in the database.
 */
export async function loadComparisonRival(
  slug: string,
): Promise<PlayerProfile | null> {
  const pairedSlug = FEATURED_RIVAL[slug];
  if (pairedSlug) {
    return getPlayerProfileBySlug(pairedSlug);
  }

  const players = await listPlayers();
  const other = players.find((player) => player.slug !== slug);
  if (!other) {
    return null;
  }

  return getPlayerProfileBySlug(other.slug);
}
