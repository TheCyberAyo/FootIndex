import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import type { SeasonStats } from "@/types/domain";

interface PlayerSeasonTableProps {
  seasons: SeasonStats[];
}

export function PlayerSeasonTable({ seasons }: PlayerSeasonTableProps) {
  return (
    <Section
      id="seasons"
      eyebrow="Seasons"
      title="Season stats"
      description="Competition-by-competition lines from API-Football sync."
    >
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs tracking-wide text-white/40 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Season</th>
                <th className="px-3 py-3 font-medium">Competition</th>
                <th className="px-3 py-3 font-medium">Team</th>
                <th className="px-3 py-3 font-medium">Apps</th>
                <th className="px-3 py-3 font-medium">Goals</th>
                <th className="px-3 py-3 font-medium">Assists</th>
                <th className="px-5 py-3 font-medium">Minutes</th>
              </tr>
            </thead>
            <tbody>
              {seasons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-white/50">
                    No season data yet. Run a players sync.
                  </td>
                </tr>
              ) : (
                seasons.map((season) => (
                  <tr
                    key={season.id}
                    className="border-t border-white/5 text-white/80"
                  >
                    <td className="px-5 py-3">{season.season}</td>
                    <td className="px-3 py-3">{season.competition}</td>
                    <td className="px-3 py-3">
                      {season.team?.short_name ?? season.team?.name ?? "—"}
                    </td>
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
    </Section>
  );
}
