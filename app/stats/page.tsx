import Link from "next/link";

import {
  ChartLegend,
  DualPlayerLegend,
} from "@/components/charts/chart-legend";
import { ChartShell } from "@/components/charts/chart-shell";
import { CompareBarChart } from "@/components/charts/compare-bar-chart";
import { DualSeasonLineChart } from "@/components/charts/season-line-chart";
import { GoalsPieChart } from "@/components/charts/goals-pie-chart";
import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import {
  CHART_COLORS,
  CHART_HEIGHT,
  buildBarSeries,
  buildDualSeasonGoals,
  buildGoalsPie,
} from "@/lib/charts";
import { buildComparison, formatCompareValue } from "@/lib/compare";
import { createPageMetadata } from "@/lib/seo";
import { getComparisonProfiles } from "@/services";
import type { SeasonStats } from "@/types/domain";

export const metadata = createPageMetadata({
  title: "Season & Career Stats",
  description:
    "Haaland vs Mbappé statistics hub — season tables, career goals, club vs international splits, and efficiency charts for Erling Haaland and Kylian Mbappé.",
  path: "/stats",
  keywords: [
    "Haaland stats",
    "Mbappé stats",
    "Haaland vs Mbappé season stats",
  ],
});

export const revalidate = 60;

function SeasonTable({
  title,
  seasons,
}: {
  title: string;
  seasons: SeasonStats[];
}) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-display text-lg font-bold text-foreground">
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs tracking-wide text-foreground/40 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">Season</th>
              <th className="px-3 py-3 font-medium">Competition</th>
              <th className="px-3 py-3 font-medium">Apps</th>
              <th className="px-3 py-3 font-medium">Goals</th>
              <th className="px-3 py-3 font-medium">Assists</th>
              <th className="px-5 py-3 font-medium">Minutes</th>
            </tr>
          </thead>
          <tbody>
            {seasons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-foreground/50">
                  No season rows yet. Run a players sync.
                </td>
              </tr>
            ) : (
              seasons.map((season) => (
                <tr
                  key={season.id}
                  className="border-t border-border/60 text-foreground/80"
                >
                  <td className="px-5 py-3">{season.season}</td>
                  <td className="px-3 py-3">{season.competition}</td>
                  <td className="px-3 py-3">{season.appearances}</td>
                  <td className="px-3 py-3 text-brand">{season.goals}</td>
                  <td className="px-3 py-3">{season.assists}</td>
                  <td className="px-5 py-3">{season.minutes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

export default async function StatsPage() {
  const { haaland, mbappe } = await getComparisonProfiles();
  const comparison = buildComparison(haaland, mbappe);
  const bars = buildBarSeries(comparison.metrics);
  const dualLine = buildDualSeasonGoals(haaland, mbappe);
  const haalandPie = buildGoalsPie(haaland.career);
  const mbappePie = buildGoalsPie(mbappe.career);

  const efficiency = [
    {
      label: "Goals / game",
      haaland: formatCompareValue(
        Number(haaland.career?.goals_per_game ?? 0),
        "decimal",
      ),
      mbappe: formatCompareValue(
        Number(mbappe.career?.goals_per_game ?? 0),
        "decimal",
      ),
    },
    {
      label: "Club goals",
      haaland: String(haaland.career?.club_goals ?? 0),
      mbappe: String(mbappe.career?.club_goals ?? 0),
    },
    {
      label: "Intl goals",
      haaland: String(haaland.career?.international_goals ?? 0),
      mbappe: String(mbappe.career?.international_goals ?? 0),
    },
    {
      label: "UCL goals",
      haaland: String(haaland.career?.champions_league_goals ?? 0),
      mbappe: String(mbappe.career?.champions_league_goals ?? 0),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Statistics"
        title="Latest Stats"
        description="Career efficiency, season trends, and competition lines synced from API-Football."
      />

      <Section
        title="Efficiency snapshot"
        description="Side-by-side career rates that fuel the debate."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {efficiency.map((item) => (
            <GlassCard key={item.label} className="p-4">
              <p className="text-xs tracking-[0.18em] text-foreground/40 uppercase">
                {item.label}
              </p>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-foreground/45">
                    {haaland.player.short_name}
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {item.haaland}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground/45">
                    {mbappe.player.short_name}
                  </p>
                  <p className="font-display text-2xl font-bold text-brand">
                    {item.mbappe}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section
        title="Visual hub"
        description="Absolute bars, season goals, and club vs international splits."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartShell
            title="Career bars"
            height={CHART_HEIGHT.md}
            legend={
              <DualPlayerLegend
                playerOneName={haaland.player.short_name}
                playerTwoName={mbappe.player.short_name}
              />
            }
          >
            <CompareBarChart
              data={bars}
              playerOneName={haaland.player.short_name}
              playerTwoName={mbappe.player.short_name}
            />
          </ChartShell>
          <ChartShell
            title="Season goals"
            height={CHART_HEIGHT.md}
            legend={
              <DualPlayerLegend
                playerOneName={haaland.player.short_name}
                playerTwoName={mbappe.player.short_name}
              />
            }
          >
            <DualSeasonLineChart
              data={dualLine}
              playerOneName={haaland.player.short_name}
              playerTwoName={mbappe.player.short_name}
            />
          </ChartShell>
          <ChartShell
            title={`${haaland.player.short_name} goals split`}
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
            title={`${mbappe.player.short_name} goals split`}
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
        <div className="mt-6">
          <Button
            asChild
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Link href="/compare#charts">Open full comparison</Link>
          </Button>
        </div>
      </Section>

      <Section
        title="Season breakdown"
        description="Free-plan sync targets season 2024 (override with API_FOOTBALL_SEASON)."
      >
        <div className="grid gap-6">
          <SeasonTable title={haaland.player.name} seasons={haaland.seasons} />
          <SeasonTable title={mbappe.player.name} seasons={mbappe.seasons} />
        </div>
      </Section>
    </>
  );
}
