import Link from "next/link";

import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";

interface PlayerVideosPlaceholderProps {
  playerName: string;
}

/**
 * Media slot — external search links until licensed embeds land (spec §57).
 */
export function PlayerVideosPlaceholder({
  playerName,
}: PlayerVideosPlaceholderProps) {
  const query = encodeURIComponent(`${playerName} highlights`);
  const searchUrl = `https://www.youtube.com/results?search_query=${query}`;

  return (
    <Section
      id="videos"
      eyebrow="Media"
      title="Videos & highlights"
      description="Curated embeds are planned for a later pass. Use the links below to find highlights."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {["Highlight reel", "Best goals", "Interview"].map((slot) => (
          <GlassCard
            key={slot}
            className="flex aspect-video flex-col items-center justify-center p-6 text-center"
          >
            <p className="text-xs tracking-wide text-white/40 uppercase">
              External search
            </p>
            <p className="mt-2 font-medium text-white">{slot}</p>
            <Link
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-sm text-brand hover:underline"
            >
              Search on YouTube →
            </Link>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
