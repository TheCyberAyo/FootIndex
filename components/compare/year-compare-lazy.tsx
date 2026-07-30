import { Suspense } from "react";

import { YearCompareSection } from "@/components/compare/year-compare-section";
import type { PlayerProfile } from "@/types/domain";

interface YearCompareLazyProps {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
  comparePath: string;
  initialSeason?: string | null;
  initialYear?: string | null;
}

function YearCompareFallback() {
  return (
    <div
      id="by-year"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mb-8 h-24 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}

/**
 * Suspense boundary for useSearchParams inside YearCompareSection.
 */
export function YearCompareLazy({
  playerOne,
  playerTwo,
  comparePath,
  initialSeason = null,
  initialYear = null,
}: YearCompareLazyProps) {
  return (
    <Suspense fallback={<YearCompareFallback />}>
      <YearCompareSection
        playerOne={playerOne}
        playerTwo={playerTwo}
        comparePath={comparePath}
        initialSeason={initialSeason}
        initialYear={initialYear}
      />
    </Suspense>
  );
}
