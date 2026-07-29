import { GlassCard } from "@/components/shared/glass-card";
import type { LiveScoreCard } from "@/types/domain";

interface LiveScoreCardsProps {
  cards: LiveScoreCard[];
}

function MatchCard({ card }: { card: LiveScoreCard }) {
  const { match, playerStats, playerSlug } = card;
  const home = match.home_team?.short_name ?? "Home";
  const away = match.away_team?.short_name ?? "Away";

  return (
    <GlassCard className="p-5" hover>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs tracking-wide text-brand uppercase">
          {match.competition}
        </p>
        <p className="text-xs text-white/40 capitalize">{match.status}</p>
      </div>
      <p className="mt-3 font-display text-xl font-bold text-white">
        {home}{" "}
        <span className="text-brand">
          {match.home_score ?? "-"}–{match.away_score ?? "-"}
        </span>{" "}
        {away}
      </p>
      <p className="mt-1 text-xs text-white/45">
        {match.venue ?? "Venue TBA"}
      </p>
      {playerStats && playerSlug ? (
        <p className="mt-4 text-sm text-white/70">
          <span className="capitalize text-white">{playerSlug}</span>
          {": "}
          {playerStats.goals}G · {playerStats.assists}A ·{" "}
          {playerStats.minutes}&apos;
          {playerStats.rating != null ? ` · ${playerStats.rating} rating` : ""}
        </p>
      ) : null}
    </GlassCard>
  );
}

/**
 * Recent appearances only — most recent 5 per player (Haaland / Mbappé).
 */
export function LiveScoreCards({ cards }: LiveScoreCardsProps) {
  if (cards.length === 0) {
    return (
      <GlassCard className="p-5 text-sm text-white/55">
        No recent player appearances yet. Run fixture sync to pull each
        player&apos;s last five matches.
      </GlassCard>
    );
  }

  const haalandCards = cards.filter((card) => card.playerSlug === "haaland");
  const mbappeCards = cards.filter((card) => card.playerSlug === "mbappe");

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="mb-3 font-display text-lg font-bold text-white">
          Haaland · last {haalandCards.length}
        </h3>
        <div className="grid gap-4">
          {haalandCards.map((card) => (
            <MatchCard key={`${card.playerSlug}-${card.match.id}`} card={card} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-display text-lg font-bold text-white">
          Mbappé · last {mbappeCards.length}
        </h3>
        <div className="grid gap-4">
          {mbappeCards.map((card) => (
            <MatchCard key={`${card.playerSlug}-${card.match.id}`} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
