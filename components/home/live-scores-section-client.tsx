"use client";

import { LiveScoreCards } from "@/components/home/live-score-cards";
import { useLiveMatches } from "@/hooks/use-football-data";
import type { LiveScoreCard } from "@/types/domain";

interface LiveScoresSectionClientProps {
  initialCards: LiveScoreCard[];
  initialHasLive: boolean;
}

/**
 * Client island: keeps score cards fresh via React Query without
 * turning the whole homepage into a client component.
 */
export function LiveScoresSectionClient({
  initialCards,
  initialHasLive,
}: LiveScoresSectionClientProps) {
  const query = useLiveMatches(initialHasLive);
  const cards = query.data?.liveCards ?? initialCards;

  return (
    <div>
      <LiveScoreCards cards={cards} />
      <p className="mt-4 text-xs text-white/35">
        Data source: {query.data?.dataSource ?? "server"}
        {query.isFetching ? " · refreshing…" : ""}
        {query.data?.hasLive ? " · live polling 15s" : ""}
      </p>
    </div>
  );
}
