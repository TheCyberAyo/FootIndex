import { AlertTriangle } from "lucide-react";

import { GlassCard } from "@/components/shared/glass-card";
import {
  assessComparePair,
  describeCompareDataTier,
} from "@/lib/compare/readiness";
import type { PlayerProfile } from "@/types/domain";

interface CompareDataQualityBannerProps {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
}

export function CompareDataQualityBanner({
  playerOne,
  playerTwo,
}: CompareDataQualityBannerProps) {
  const readiness = assessComparePair(playerOne, playerTwo);

  if (readiness.pairReady) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
        <GlassCard className="border-brand/20 bg-brand/5 p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {describeCompareDataTier(playerOne)}{" "}
            {describeCompareDataTier(playerTwo)}
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
      <GlassCard className="border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
        <div className="flex gap-3">
          <AlertTriangle
            className="mt-0.5 size-5 shrink-0 text-amber-400"
            aria-hidden="true"
          />
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">
              Career comparison unavailable for this pair
            </p>
            <p>
              We only publish career head-to-head scores when both players have
              verified baselines or enough synced seasons. Missing stats are
              never shown as zero.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>{describeCompareDataTier(playerOne)}</li>
              <li>{describeCompareDataTier(playerTwo)}</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
