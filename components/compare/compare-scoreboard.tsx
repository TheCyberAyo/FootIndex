import { GlassCard } from "@/components/shared/glass-card";
import type { CompareScoreboard } from "@/lib/compare";
import { cn } from "@/lib/utils";

interface CompareScoreboardProps {
  scoreboard: CompareScoreboard;
  playerOneName: string;
  playerTwoName: string;
}

export function CompareScoreboardCard({
  scoreboard,
  playerOneName,
  playerTwoName,
}: CompareScoreboardProps) {
  const playerOneLeads = scoreboard.playerOneWins > scoreboard.playerTwoWins;
  const playerTwoLeads = scoreboard.playerTwoWins > scoreboard.playerOneWins;

  return (
    <GlassCard className="grid grid-cols-3 items-center gap-2 px-4 py-5 sm:px-6">
      <div>
        <p className="text-xs tracking-wide text-white/40 uppercase">
          {playerOneName}
        </p>
        <p
          className={cn(
            "font-display text-4xl font-extrabold",
            playerOneLeads ? "text-brand" : "text-white",
          )}
        >
          {scoreboard.playerOneWins}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs tracking-[0.2em] text-white/40 uppercase">
          Metrics won
        </p>
        <p className="mt-1 text-sm text-white/50">{scoreboard.ties} tied</p>
      </div>
      <div className="text-right">
        <p className="text-xs tracking-wide text-white/40 uppercase">
          {playerTwoName}
        </p>
        <p
          className={cn(
            "font-display text-4xl font-extrabold",
            playerTwoLeads ? "text-brand" : "text-white",
          )}
        >
          {scoreboard.playerTwoWins}
        </p>
      </div>
    </GlassCard>
  );
}
