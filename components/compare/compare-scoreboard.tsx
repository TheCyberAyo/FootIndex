import { GlassCard } from "@/components/shared/glass-card";
import type { CompareScoreboard } from "@/lib/compare";
import { cn } from "@/lib/utils";

interface CompareScoreboardProps {
  scoreboard: CompareScoreboard;
  haalandName: string;
  mbappeName: string;
}

export function CompareScoreboardCard({
  scoreboard,
  haalandName,
  mbappeName,
}: CompareScoreboardProps) {
  const haalandLeads = scoreboard.haalandWins > scoreboard.mbappeWins;
  const mbappeLeads = scoreboard.mbappeWins > scoreboard.haalandWins;

  return (
    <GlassCard className="grid grid-cols-3 items-center gap-2 px-4 py-5 sm:px-6">
      <div>
        <p className="text-xs tracking-wide text-white/40 uppercase">
          {haalandName}
        </p>
        <p
          className={cn(
            "font-display text-4xl font-extrabold",
            haalandLeads ? "text-brand" : "text-white",
          )}
        >
          {scoreboard.haalandWins}
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
          {mbappeName}
        </p>
        <p
          className={cn(
            "font-display text-4xl font-extrabold",
            mbappeLeads ? "text-brand" : "text-white",
          )}
        >
          {scoreboard.mbappeWins}
        </p>
      </div>
    </GlassCard>
  );
}
