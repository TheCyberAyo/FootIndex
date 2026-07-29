import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";

interface PlayerVideosPlaceholderProps {
  playerName: string;
}

/**
 * Media slot reserved for future highlight embeds (not part of v1 launch).
 */
export function PlayerVideosPlaceholder({
  playerName,
}: PlayerVideosPlaceholderProps) {
  const slots = ["Highlight reel", "Best goals", "Interview"];

  return (
    <Section
      id="videos"
      eyebrow="Media"
      title="Videos"
      description={`Official highlight embeds for ${playerName} are planned for a later media pass — not required for career stats.`}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {slots.map((slot) => (
          <GlassCard
            key={slot}
            className="flex aspect-video flex-col items-center justify-center p-6 text-center"
          >
            <p className="text-xs tracking-wide text-white/40 uppercase">
              Highlights coming later
            </p>
            <p className="mt-2 font-medium text-white">{slot}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
