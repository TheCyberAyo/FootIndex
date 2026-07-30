import Link from "next/link";
import Image from "next/image";

import { GlassCard } from "@/components/shared/glass-card";
import type { PlayerSearchResult } from "@/types/domain";

interface TrendingPlayersGridProps {
  players: PlayerSearchResult[];
}

export function TrendingPlayersGrid({ players }: TrendingPlayersGridProps) {
  if (players.length === 0) {
    return (
      <GlassCard className="p-6 text-foreground/60">
        No players in the database yet. Run{" "}
        <code className="text-brand">POST /api/players/world</code> to import
        squads globally, then sync stats.
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <GlassCard key={player.id} className="p-5" hover>
          <Link href={player.href} className="flex items-start gap-4">
            {player.imageUrl ? (
              <Image
                src={player.imageUrl}
                alt={player.name}
                width={56}
                height={56}
                className="size-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white/70">
                {player.shortName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 text-left">
              <h3 className="font-display text-lg font-bold text-foreground">
                {player.name}
              </h3>
              <p className="mt-1 text-sm text-foreground/60">
                {[player.clubName, player.positionLabel, player.nationality]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-3 text-sm font-medium text-brand">
                View profile →
              </p>
            </div>
          </Link>
        </GlassCard>
      ))}
    </div>
  );
}
