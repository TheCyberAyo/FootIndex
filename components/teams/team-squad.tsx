import Link from "next/link";
import Image from "next/image";

import { GlassCard } from "@/components/shared/glass-card";
import { formatPosition } from "@/lib/players/format";
import { playerPath } from "@/lib/players/paths";
import type { Player } from "@/types/domain";

interface TeamSquadProps {
  players: Player[];
  teamName: string;
}

export function TeamSquad({ players, teamName }: TeamSquadProps) {
  if (players.length === 0) {
    return (
      <GlassCard className="p-6 text-foreground/60">
        No players are currently linked to {teamName}. Sync player profiles to
        populate the squad.
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <GlassCard key={player.id} className="p-5" hover>
          <Link href={playerPath(player.slug)} className="flex items-start gap-4">
            {player.image_url ? (
              <Image
                src={player.image_url}
                alt={player.name}
                width={56}
                height={56}
                className="size-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white/70">
                {player.short_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {player.name}
              </h3>
              <p className="mt-1 text-sm text-foreground/60">
                {formatPosition(player.position)} · {player.nationality}
              </p>
            </div>
          </Link>
        </GlassCard>
      ))}
    </div>
  );
}
