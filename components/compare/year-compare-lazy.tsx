import { Suspense } from "react";

import { YearCompareSection } from "@/components/compare/year-compare-section";

interface YearCompareLazyProps {
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
  initialSeason = null,
  initialYear = null,
}: YearCompareLazyProps) {
  return (
    <Suspense fallback={<YearCompareFallback />}>
      <YearCompareSection
        initialSeason={initialSeason}
        initialYear={initialYear}
      />
    </Suspense>
  );
}
