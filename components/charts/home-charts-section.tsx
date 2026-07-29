import Link from "next/link";

import { HaalandMbappeLegend } from "@/components/charts/chart-legend";
import { ChartShell } from "@/components/charts/chart-shell";
import { CompareBarChart } from "@/components/charts/compare-bar-chart";
import { CompareRadarChart } from "@/components/charts/compare-radar-chart";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import {
  CHART_HEIGHT,
  buildBarSeries,
  buildRadarSeries,
} from "@/lib/charts";
import { buildComparison } from "@/lib/compare";
import type { PlayerProfile } from "@/types/domain";

interface HomeChartsSectionProps {
  haaland: PlayerProfile;
  mbappe: PlayerProfile;
}

/**
 * Home teaser charts — radar + bars, full suite lives on /compare.
 */
export function HomeChartsSection({
  haaland,
  mbappe,
}: HomeChartsSectionProps) {
  const comparison = buildComparison(haaland, mbappe);
  const radar = buildRadarSeries(comparison.metrics);
  const bars = buildBarSeries(comparison.metrics);
  const haalandName = haaland.player.short_name;
  const mbappeName = mbappe.player.short_name;

  return (
    <Section
      id="charts"
      eyebrow="Charts"
      title="See the shape of the rivalry"
      description="Relative radar and absolute bars — open Compare for pies and season lines."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartShell
          title="Ability radar"
          height={CHART_HEIGHT.md}
          legend={
            <HaalandMbappeLegend
              haalandName={haalandName}
              mbappeName={mbappeName}
            />
          }
        >
          <CompareRadarChart
            data={radar}
            haalandName={haalandName}
            mbappeName={mbappeName}
          />
        </ChartShell>
        <ChartShell
          title="Head-to-head bars"
          height={CHART_HEIGHT.md}
          legend={
            <HaalandMbappeLegend
              haalandName={haalandName}
              mbappeName={mbappeName}
            />
          }
        >
          <CompareBarChart
            data={bars}
            haalandName={haalandName}
            mbappeName={mbappeName}
          />
        </ChartShell>
      </div>
      <div className="mt-6">
        <Button
          asChild
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Link href="/compare#charts">All charts on Compare</Link>
        </Button>
      </div>
    </Section>
  );
}
