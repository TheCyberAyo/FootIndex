import {
  ChartLegend,
  HaalandMbappeLegend,
} from "@/components/charts/chart-legend";
import { ChartShell } from "@/components/charts/chart-shell";
import { CompareBarChart } from "@/components/charts/compare-bar-chart";
import { CompareRadarChart } from "@/components/charts/compare-radar-chart";
import { GoalsPieChart } from "@/components/charts/goals-pie-chart";
import { DualSeasonLineChart } from "@/components/charts/season-line-chart";
import { Section } from "@/components/shared/section";
import {
  CHART_COLORS,
  CHART_HEIGHT,
  buildBarSeries,
  buildDualSeasonGoals,
  buildGoalsPie,
  buildRadarSeries,
} from "@/lib/charts";
import { buildComparison } from "@/lib/compare";
import type { PlayerProfile } from "@/types/domain";

interface CompareChartsSectionProps {
  haaland: PlayerProfile;
  mbappe: PlayerProfile;
}

/**
 * Server section: series built on the server, Recharts islands on the client.
 */
export function CompareChartsSection({
  haaland,
  mbappe,
}: CompareChartsSectionProps) {
  const comparison = buildComparison(haaland, mbappe);
  const radar = buildRadarSeries(comparison.metrics);
  const bars = buildBarSeries(comparison.metrics);
  const dualLine = buildDualSeasonGoals(haaland, mbappe);
  const haalandPie = buildGoalsPie(haaland.career);
  const mbappePie = buildGoalsPie(mbappe.career);
  const haalandName = haaland.player.short_name;
  const mbappeName = mbappe.player.short_name;

  return (
    <Section
      id="charts"
      eyebrow="Visuals"
      title="Charts"
      description="Radar is relative (0–100 per metric). Bars and pies use absolute career totals."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartShell
          title="Ability radar"
          description="Normalized head-to-head profile"
          height={CHART_HEIGHT.lg}
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
          description="Absolute career metrics"
          height={CHART_HEIGHT.lg}
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

        <ChartShell
          title="Season goals"
          description="Goals summed across competitions per season"
          height={CHART_HEIGHT.md}
          className="lg:col-span-2"
          legend={
            <HaalandMbappeLegend
              haalandName={haalandName}
              mbappeName={mbappeName}
            />
          }
        >
          <DualSeasonLineChart
            data={dualLine}
            haalandName={haalandName}
            mbappeName={mbappeName}
          />
        </ChartShell>

        <ChartShell
          title={`${haalandName} goals split`}
          description="Club vs international"
          height={CHART_HEIGHT.sm}
          legend={
            <ChartLegend
              items={[
                { label: "Club", color: CHART_COLORS.club },
                { label: "International", color: CHART_COLORS.international },
              ]}
            />
          }
        >
          <GoalsPieChart data={haalandPie} />
        </ChartShell>

        <ChartShell
          title={`${mbappeName} goals split`}
          description="Club vs international"
          height={CHART_HEIGHT.sm}
          legend={
            <ChartLegend
              items={[
                { label: "Club", color: CHART_COLORS.club },
                { label: "International", color: CHART_COLORS.international },
              ]}
            />
          }
        >
          <GoalsPieChart data={mbappePie} />
        </ChartShell>
      </div>
    </Section>
  );
}
