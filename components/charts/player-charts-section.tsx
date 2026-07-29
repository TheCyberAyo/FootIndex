import {
  ChartLegend,
  DualPlayerLegend,
} from "@/components/charts/chart-legend";
import { ChartShell } from "@/components/charts/chart-shell";
import { CompareRadarChart } from "@/components/charts/compare-radar-chart";
import { GoalsPieChart } from "@/components/charts/goals-pie-chart";
import { SeasonLineChart } from "@/components/charts/season-line-chart";
import { Section } from "@/components/shared/section";
import {
  CHART_COLORS,
  CHART_HEIGHT,
  buildGoalsPie,
  buildRadarSeries,
  buildSeasonProgression,
} from "@/lib/charts";
import { buildComparison } from "@/lib/compare";
import type { PlayerProfile } from "@/types/domain";

interface PlayerChartsSectionProps {
  profile: PlayerProfile;
  rival?: PlayerProfile;
}

/**
 * Player page charts — pie + season line for self; radar when a rival exists.
 */
export function PlayerChartsSection({
  profile,
  rival,
}: PlayerChartsSectionProps) {
  const pie = buildGoalsPie(profile.career);
  const progression = buildSeasonProgression(profile.seasons);
  const hasRival = rival != null;
  const comparison =
    hasRival && rival ? buildComparison(profile, rival) : null;
  const radar = comparison ? buildRadarSeries(comparison.metrics) : null;

  return (
    <Section
      id="charts"
      eyebrow="Visuals"
      title="Charts"
      description={
        hasRival
          ? "Season progression from synced competition rows. Radar includes a comparison partner for context."
          : "Season progression from synced competition rows."
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartShell
          title="Goals split"
          description="Club vs international career goals"
          height={CHART_HEIGHT.md}
          legend={
            <ChartLegend
              items={[
                { label: "Club", color: CHART_COLORS.club },
                { label: "International", color: CHART_COLORS.international },
              ]}
            />
          }
        >
          <GoalsPieChart data={pie} />
        </ChartShell>

        <ChartShell
          title="Season progression"
          description="Goals and assists by season"
          height={CHART_HEIGHT.md}
          legend={
            <ChartLegend
              items={[
                { label: "Goals", color: CHART_COLORS.mbappe },
                { label: "Assists", color: CHART_COLORS.haaland },
              ]}
            />
          }
        >
          <SeasonLineChart data={progression} />
        </ChartShell>

        {hasRival && rival && radar ? (
          <ChartShell
            title="Ability radar"
            description={`Normalized vs ${rival.player.short_name}`}
            height={CHART_HEIGHT.lg}
            className="lg:col-span-2"
            legend={
              <DualPlayerLegend
                playerOneName={profile.player.short_name}
                playerTwoName={rival.player.short_name}
              />
            }
          >
            <CompareRadarChart
              data={radar}
              playerOneName={profile.player.short_name}
              playerTwoName={rival.player.short_name}
            />
          </ChartShell>
        ) : null}
      </div>
    </Section>
  );
}
