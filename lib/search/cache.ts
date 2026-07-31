import { revalidateTag } from "next/cache";

export const PLAYER_SEARCH_CACHE_TAG = "player-search";

export function invalidatePlayerSearchCache(): void {
  revalidateTag(PLAYER_SEARCH_CACHE_TAG);
}
