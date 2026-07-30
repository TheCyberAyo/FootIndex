import { notFound } from "next/navigation";

import {
  CompareRoutePage,
} from "@/components/compare/compare-route-page";
import {
  createCompareMetadata,
  isCompareSlugFormatValid,
} from "@/lib/compare/load-compare";
import { isValidCompareSlugPair } from "@/lib/compare/paths";
import { DEFAULT_COMPARE_SLUGS } from "@/lib/compare/paths";
import { listPlayers } from "@/services";

export const revalidate = 60;
export const dynamicParams = true;

interface CompareSlugPageProps {
  params: Promise<{ playerOne: string; playerTwo: string }>;
  searchParams: Promise<{
    season?: string;
    year?: string;
  }>;
}

/** Pre-render featured rivalry + a small marquee set — not all N² pairs. */
export async function generateStaticParams() {
  const players = await listPlayers();
  const marqueeSlugs = [
    DEFAULT_COMPARE_SLUGS.playerOne,
    DEFAULT_COMPARE_SLUGS.playerTwo,
    ...players.slice(0, 8).map((player) => player.slug),
  ];
  const uniqueSlugs = [...new Set(marqueeSlugs)];
  const pairs: Array<{ playerOne: string; playerTwo: string }> = [];

  for (let i = 0; i < uniqueSlugs.length; i += 1) {
    for (let j = 0; j < uniqueSlugs.length; j += 1) {
      if (i !== j) {
        const [playerOne, playerTwo] = [uniqueSlugs[i], uniqueSlugs[j]].sort();
        pairs.push({ playerOne, playerTwo });
      }
    }
  }

  return pairs;
}

export async function generateMetadata({ params }: CompareSlugPageProps) {
  const { playerOne, playerTwo } = await params;
  return createCompareMetadata(playerOne, playerTwo);
}

export default async function CompareSlugPage({
  params,
  searchParams,
}: CompareSlugPageProps) {
  const [{ playerOne, playerTwo }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  if (
    !isCompareSlugFormatValid(playerOne) ||
    !isCompareSlugFormatValid(playerTwo) ||
    !isValidCompareSlugPair(playerOne, playerTwo)
  ) {
    notFound();
  }

  return (
    <CompareRoutePage
      playerOneSlug={playerOne}
      playerTwoSlug={playerTwo}
      initialSeason={query.season ?? null}
      initialYear={query.year ?? null}
    />
  );
}
