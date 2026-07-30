import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import { buildPlayerRecords } from "@/lib/players/player-records";
import type { CareerStats, Player, SeasonStats } from "@/types/domain";

interface PlayerRecordsProps {
  player: Player;
  career: CareerStats | null;
  seasons: SeasonStats[];
}

export function PlayerRecords({ player, career, seasons }: PlayerRecordsProps) {
  const records = buildPlayerRecords({ player, career, seasons });

  if (records.length === 0) {
    return null;
  }

  return (
    <Section
      id="records"
      eyebrow="Milestones"
      title="Player records"
      description="Personal bests from synced season and career data only."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {records.map((record) => (
          <GlassCard
            key={record.id}
            as="li"
            className="px-4 py-4"
            hover
          >
            <p className="text-xs uppercase tracking-wide text-white/40">
              {record.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-brand">
              {record.value}
            </p>
            <p className="mt-1 text-sm text-white/55">{record.detail}</p>
          </GlassCard>
        ))}
      </ul>
    </Section>
  );
}
