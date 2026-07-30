import Link from "next/link";

import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import {
  buildComparison,
  defaultComparePath,
  formatCompareValue,
  type CompareMetric,
} from "@/lib/compare";
import { cn } from "@/lib/utils";
import type { PlayerProfile } from "@/types/domain";

interface CareerComparePreviewProps {
  haaland: PlayerProfile;
  mbappe: PlayerProfile;
}

/** Home teaser uses the same engine as /compare — subset for scanability. */
const PREVIEW_KEYS = new Set([
  "goals",
  "assists",
  "appearances",
  "goals_per_game",
  "champions_league_goals",
  "international_goals",
]);

function PreviewRow({ metric }: { metric: CompareMetric }) {
  const playerOneLeads = metric.winner === "playerOne";
  const playerTwoLeads = metric.winner === "playerTwo";

  return (
    <GlassCard className="grid grid-cols-3 items-center gap-2 px-4 py-3 sm:px-5">
      <p
        className={cn(
          "text-left font-semibold",
          playerOneLeads ? "text-brand" : "text-white",
        )}
      >
        {formatCompareValue(metric.playerOneValue, metric.format)}
      </p>
      <div className="text-center">
        <p className="text-[10px] tracking-[0.18em] text-white/40 uppercase sm:text-xs">
          {metric.label}
        </p>
      </div>
      <p
        className={cn(
          "text-right font-semibold",
          playerTwoLeads ? "text-brand" : "text-white",
        )}
      >
        {formatCompareValue(metric.playerTwoValue, metric.format)}
      </p>
    </GlassCard>
  );
}

/**
 * Server Component home preview — shares compare engine with /compare.
 */
export function CareerComparePreview({
  haaland,
  mbappe,
}: CareerComparePreviewProps) {
  const { metrics } = buildComparison(haaland, mbappe);
  const previewMetrics = metrics.filter((metric) =>
    PREVIEW_KEYS.has(metric.key),
  );

  return (
    <div className="grid gap-3">
      {previewMetrics.map((metric) => (
        <PreviewRow key={metric.key} metric={metric} />
      ))}
      <div className="pt-2">
        <Button
          asChild
          variant="brand"
          className="w-full sm:w-auto"
        >
          <Link href={defaultComparePath()}>Open full comparison</Link>
        </Button>
      </div>
    </div>
  );
}
