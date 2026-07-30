import { notFound } from "next/navigation";

import {
  CompareRoutePage,
} from "@/components/compare/compare-route-page";
import {
  createCompareMetadata,
  isCompareSlugFormatValid,
} from "@/lib/compare/load-compare";
import { isValidCompareSlugPair } from "@/lib/compare/paths";
import { listPrerenderComparePairs } from "@/lib/seo/prerender";

export const revalidate = 60;
export const dynamicParams = true;

interface CompareSlugPageProps {
  params: Promise<{ playerOne: string; playerTwo: string }>;
  searchParams: Promise<{
    season?: string;
    year?: string;
  }>;
}

/** Pre-render marquee compare pairs — all other pairs via dynamicParams. */
export async function generateStaticParams() {
  return listPrerenderComparePairs();
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
