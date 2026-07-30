import { Suspense } from "react";

import { ComparePlayerPicker } from "@/components/compare/compare-player-picker";

interface ComparePlayerPickerLazyProps {
  playerOneSlug: string;
  playerOneName: string;
  playerOneImageUrl?: string | null;
  playerTwoSlug: string;
  playerTwoName: string;
  playerTwoImageUrl?: string | null;
}

function ComparePlayerPickerFallback() {
  return (
    <div
      id="change-players"
      className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8"
    >
      <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}

export function ComparePlayerPickerLazy(props: ComparePlayerPickerLazyProps) {
  return (
    <Suspense fallback={<ComparePlayerPickerFallback />}>
      <ComparePlayerPicker {...props} />
    </Suspense>
  );
}
