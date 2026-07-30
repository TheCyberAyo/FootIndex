import { FEATURED_RIVALRY } from "@/lib/brand/featured-rivalry";
import { comparePath, isFeaturedRivalryCompare } from "@/lib/compare/paths";
import { localPlayers } from "@/lib/data/local-seed";
import { STARTER_PLAYER_CATALOG } from "@/lib/data/starter-catalog";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";

/** Players pre-rendered at build and used for compare sitemap pairs (not the full catalog). */
export const PRERENDER_PLAYER_LIMIT = 32;

export interface CompareSlugPair {
  playerOne: string;
  playerTwo: string;
}

export function listCuratedPlayerSlugs(): string[] {
  return [
    FEATURED_RIVALRY.playerOneSlug,
    FEATURED_RIVALRY.playerTwoSlug,
    ...STARTER_PLAYER_CATALOG.map((entry) => entry.slug),
  ];
}

/**
 * Lightweight slug list for build-time pre-render — avoids loading every player row.
 * All other player/compare URLs remain available via `dynamicParams`.
 */
export async function listPrerenderPlayerSlugs(): Promise<string[]> {
  const slugs = new Set(listCuratedPlayerSlugs());

  if (!isSupabaseConfigured()) {
    for (const player of localPlayers) {
      slugs.add(player.slug);
      if (slugs.size >= PRERENDER_PLAYER_LIMIT) {
        break;
      }
    }
    return [...slugs];
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("players")
    .select("slug")
    .order("name", { ascending: true })
    .limit(PRERENDER_PLAYER_LIMIT);

  for (const row of result.data ?? []) {
    slugs.add(row.slug);
  }

  return [...slugs];
}

/** Canonical unordered compare pairs among a marquee slug set (i < j). */
export function listMarqueeComparePairs(slugs: readonly string[]): CompareSlugPair[] {
  const uniqueSlugs = [...new Set(slugs)];
  const pairs: CompareSlugPair[] = [];

  for (let i = 0; i < uniqueSlugs.length; i += 1) {
    for (let j = i + 1; j < uniqueSlugs.length; j += 1) {
      const [playerOne, playerTwo] = [uniqueSlugs[i], uniqueSlugs[j]].sort();
      pairs.push({ playerOne, playerTwo });
    }
  }

  return pairs;
}

export async function listPrerenderComparePairs(): Promise<CompareSlugPair[]> {
  const slugs = await listPrerenderPlayerSlugs();
  return listMarqueeComparePairs(slugs);
}

export function comparePairPriority(playerOne: string, playerTwo: string): number {
  if (isFeaturedRivalryCompare(playerOne, playerTwo)) {
    return 0.9;
  }

  const curated = new Set(listCuratedPlayerSlugs());
  if (curated.has(playerOne) && curated.has(playerTwo)) {
    return 0.85;
  }

  return 0.75;
}

export function comparePairToPath(pair: CompareSlugPair): string {
  return comparePath(pair.playerOne, pair.playerTwo);
}
