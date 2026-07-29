import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import {
  formatHeight,
  formatPosition,
  getPlayerAge,
} from "@/lib/players/format";
import type { PlayerProfile } from "@/types/domain";

interface PlayerBioProps {
  profile: PlayerProfile;
}

interface BioItem {
  label: string;
  value: string;
}

export function PlayerBio({ profile }: PlayerBioProps) {
  const { player } = profile;

  const items: BioItem[] = [
    { label: "Club", value: player.current_team?.name ?? "—" },
    { label: "Nationality", value: player.nationality },
    { label: "Age", value: String(getPlayerAge(player.date_of_birth)) },
    { label: "Height", value: formatHeight(player.height_cm) },
    { label: "Position", value: formatPosition(player.position) },
    { label: "Foot", value: player.preferred_foot ?? "—" },
  ];

  return (
    <Section
      eyebrow="Biography"
      title="The essentials"
      description={
        player.bio ||
        `${player.name} — career numbers, silverware, and season form in one place.`
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <GlassCard key={item.label} className="px-5 py-4">
            <p className="text-xs tracking-wide text-white/40 uppercase">
              {item.label}
            </p>
            <p className="mt-1 font-display text-xl font-bold text-white">
              {item.value}
            </p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
