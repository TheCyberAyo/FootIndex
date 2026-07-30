import { Section } from "@/components/shared/section";
import type { TimelineEvent } from "@/lib/players/timeline";

interface PlayerTimelineProps {
  events: TimelineEvent[];
}

export function PlayerTimeline({ events }: PlayerTimelineProps) {
  return (
    <Section
      id="timeline"
      eyebrow="Journey"
      title="Career timeline"
      description="Milestones from trophies, awards, transfers, and standout seasons."
    >
      {events.length === 0 ? (
        <p className="text-sm text-white/50">Timeline will fill after sync.</p>
      ) : (
        <ol className="relative space-y-0 border-l border-white/15 pl-6">
          {events.map((event) => (
            <li key={event.id} className="relative pb-8 last:pb-0">
              <span
                aria-hidden
                className="absolute top-1.5 -left-[1.95rem] size-2.5 rounded-full bg-brand shadow-[0_0_0_4px_rgba(245,197,24,0.15)]"
              />
              <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                {event.year} · {event.kind}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-white">
                {event.title}
              </p>
              <p className="mt-1 text-sm text-white/55">{event.subtitle}</p>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
