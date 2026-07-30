import Image from "next/image";
import Link from "next/link";

import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import { buildClubHistory } from "@/lib/players/club-history";
import { teamPath } from "@/lib/teams/paths";
import type { SeasonStats, Trophy } from "@/types/domain";

interface PlayerClubHistoryProps {
  seasons: SeasonStats[];
  trophies: Trophy[];
}

export function PlayerClubHistory({ seasons, trophies }: PlayerClubHistoryProps) {
  const clubs = buildClubHistory(seasons, trophies);

  if (clubs.length === 0) {
    return null;
  }

  return (
    <Section
      id="club-history"
      eyebrow="Club career"
      title="Club history"
      description="Aggregated from synced season rows and trophy wins."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {clubs.map((entry) => (
          <GlassCard
            key={entry.team.id}
            className="flex gap-4 p-5"
            hover
          >
            {entry.team.logo_url ? (
              <Image
                src={entry.team.logo_url}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 object-contain"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-white/50">
                {entry.team.short_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <Link
                href={teamPath(entry.team.slug)}
                className="font-display text-lg font-semibold text-white hover:text-brand"
              >
                {entry.team.name}
              </Link>
              <p className="text-sm text-white/50">{entry.yearsLabel}</p>
              <dl className="mt-3 grid grid-cols-4 gap-2 text-sm">
                <div>
                  <dt className="text-white/40">Apps</dt>
                  <dd className="font-medium text-white">{entry.appearances}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Goals</dt>
                  <dd className="font-medium text-brand">{entry.goals}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Assists</dt>
                  <dd className="font-medium text-white">{entry.assists}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Trophies</dt>
                  <dd className="font-medium text-white">{entry.trophiesWon}</dd>
                </div>
              </dl>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
