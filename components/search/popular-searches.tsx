"use client";

import Link from "next/link";

import { recordSearchClick } from "@/lib/search/session";
import type { PlayerSearchResult } from "@/types/domain";

interface PopularSearchesProps {
  players: PlayerSearchResult[];
  label?: string;
  className?: string;
}

export function PopularSearches({
  players,
  label = "Most searched",
  className,
}: PopularSearchesProps) {
  if (players.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <p className="mb-2 text-sm text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <Link
            key={player.id}
            href={player.href}
            className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-brand/40 hover:text-foreground"
            onClick={() => {
              void recordSearchClick({
                searchTerm: player.name,
                playerId: player.id,
              });
            }}
          >
            {player.shortName}
          </Link>
        ))}
      </div>
    </div>
  );
}
