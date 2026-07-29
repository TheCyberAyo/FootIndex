import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import { formatGoalsPerGame, formatStat } from "@/lib/players/format";
import type { CareerStats } from "@/types/domain";

interface PlayerStatsGridProps {
  career: CareerStats | null;
}

interface StatItem {
  label: string;
  value: string;
}

export function PlayerStatsGrid({ career }: PlayerStatsGridProps) {
  const items: StatItem[] = [
    { label: "Career Goals", value: formatStat(career?.goals) },
    { label: "Assists", value: formatStat(career?.assists) },
    { label: "Appearances", value: formatStat(career?.appearances) },
    { label: "Minutes", value: formatStat(career?.minutes) },
    {
      label: "Goals / Game",
      value: formatGoalsPerGame(
        career ? Number(career.goals_per_game) : null,
      ),
    },
    {
      label: "UCL Goals",
      value: formatStat(career?.champions_league_goals),
    },
    {
      label: "International Goals",
      value: formatStat(career?.international_goals),
    },
    { label: "Club Goals", value: formatStat(career?.club_goals) },
  ];

  return (
    <Section
      id="career"
      eyebrow="Career"
      title="Career stats"
      description="Totals roll up from synced season lines in Supabase."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <GlassCard key={item.label} className="px-5 py-5" hover>
            <p className="text-xs tracking-wide text-white/40 uppercase">
              {item.label}
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold text-brand">
              {item.value}
            </p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
