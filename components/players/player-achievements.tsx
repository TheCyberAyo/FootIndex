import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import type { Award, Trophy } from "@/types/domain";

interface PlayerAchievementsProps {
  trophies: Trophy[];
  awards: Award[];
}

export function PlayerAchievements({
  trophies,
  awards,
}: PlayerAchievementsProps) {
  return (
    <Section
      id="achievements"
      eyebrow="Silverware"
      title="Achievements"
      description="Trophies synced from API-Football. Awards stay curated until deeper sources land."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-display text-lg font-bold text-white">
            Trophies
          </h3>
          <ul className="grid gap-2">
            {trophies.length === 0 ? (
              <GlassCard as="li" className="px-4 py-3 text-sm text-white/50">
                No trophies synced yet.
              </GlassCard>
            ) : (
              trophies.slice(0, 12).map((trophy) => (
                <GlassCard
                  key={trophy.id}
                  as="li"
                  className="flex items-center justify-between gap-3 px-4 py-3"
                  hover
                >
                  <div>
                    <p className="font-medium text-white">{trophy.name}</p>
                    <p className="text-xs text-white/45">
                      {trophy.season ?? trophy.year}
                      {trophy.team?.short_name
                        ? ` · ${trophy.team.short_name}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-sm text-brand">{trophy.year}</span>
                </GlassCard>
              ))
            )}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-display text-lg font-bold text-white">
            Awards
          </h3>
          <ul className="grid gap-2">
            {awards.length === 0 ? (
              <GlassCard as="li" className="px-4 py-3 text-sm text-white/50">
                No awards on record yet.
              </GlassCard>
            ) : (
              awards.slice(0, 12).map((award) => (
                <GlassCard
                  key={award.id}
                  as="li"
                  className="flex items-center justify-between gap-3 px-4 py-3"
                  hover
                >
                  <div>
                    <p className="font-medium text-white">{award.name}</p>
                    <p className="text-xs text-white/45">
                      {award.competition ?? award.season ?? award.year}
                    </p>
                  </div>
                  <span className="text-sm text-brand">{award.year}</span>
                </GlassCard>
              ))
            )}
          </ul>
        </div>
      </div>
    </Section>
  );
}
