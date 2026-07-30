import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import { buildInternationalCareer } from "@/lib/players/international-career";
import type { SeasonStats } from "@/types/domain";

interface PlayerInternationalCareerProps {
  seasons: SeasonStats[];
  nationality: string;
}

export function PlayerInternationalCareer({
  seasons,
  nationality,
}: PlayerInternationalCareerProps) {
  const summary = buildInternationalCareer(seasons, nationality);

  if (!summary) {
    return null;
  }

  return (
    <Section
      id="international"
      eyebrow="Country"
      title="International career"
      description={
        summary.teamName
          ? `${summary.teamName} — caps and major tournaments from synced data.`
          : "Caps and major tournaments from synced data."
      }
    >
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/40">
              {summary.country}
            </p>
            <p className="font-display text-3xl font-bold text-white">
              {summary.caps} caps
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <dt className="text-xs text-white/40">Goals</dt>
              <dd className="text-xl font-semibold text-brand">{summary.goals}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/40">Assists</dt>
              <dd className="text-xl font-semibold text-white">{summary.assists}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/40">Minutes</dt>
              <dd className="text-xl font-semibold text-white">{summary.minutes}</dd>
            </div>
          </dl>
        </div>

        {summary.majorCompetitions.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-xs tracking-wide text-white/40 uppercase">
                <tr>
                  <th className="pb-2 font-medium">Competition</th>
                  <th className="pb-2 font-medium">Apps</th>
                  <th className="pb-2 font-medium">Goals</th>
                  <th className="pb-2 font-medium">Assists</th>
                </tr>
              </thead>
              <tbody>
                {summary.majorCompetitions.map((row) => (
                  <tr key={row.label} className="border-t border-white/5 text-white/80">
                    <td className="py-2">{row.label}</td>
                    <td className="py-2">{row.appearances}</td>
                    <td className="py-2 text-brand">{row.goals}</td>
                    <td className="py-2">{row.assists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </GlassCard>
    </Section>
  );
}
