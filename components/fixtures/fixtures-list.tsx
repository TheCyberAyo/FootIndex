import { format } from "date-fns";

import { GlassCard } from "@/components/shared/glass-card";
import type { Match } from "@/types/domain";

interface FixturesListProps {
  matches: Match[];
  emptyLabel?: string;
}

function FixtureRow({ match }: { match: Match }) {
  const home = match.home_team?.short_name ?? match.home_team?.name ?? "Home";
  const away = match.away_team?.short_name ?? match.away_team?.name ?? "Away";
  const kickoff = format(new Date(match.kickoff_at), "EEE d MMM yyyy · HH:mm");

  return (
    <div className="flex flex-col gap-2 border-t border-border/60 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs tracking-wide text-brand uppercase">
          {match.competition}
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-foreground">
          {home}{" "}
          <span className="text-brand">
            {match.home_score ?? "–"}–{match.away_score ?? "–"}
          </span>{" "}
          {away}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {kickoff} UTC · {match.venue ?? "Venue TBA"}
        </p>
      </div>
      <p className="text-xs capitalize text-muted-foreground">{match.status}</p>
    </div>
  );
}

export function FixturesList({
  matches,
  emptyLabel = "No fixtures synced for this view yet.",
}: FixturesListProps) {
  if (matches.length === 0) {
    return (
      <GlassCard className="p-5 text-sm text-muted-foreground">{emptyLabel}</GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      {matches.map((match) => (
        <FixtureRow key={match.id} match={match} />
      ))}
    </GlassCard>
  );
}
