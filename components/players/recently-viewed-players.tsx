"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  clearRecentlyViewedPlayers,
  fetchRecentlyViewedPlayers,
  type RecentlyViewedPlayerEntry,
} from "@/lib/players/views";
import { cn } from "@/lib/utils";

interface RecentlyViewedPlayersProps {
  excludeSlug?: string;
  limit?: number;
  className?: string;
}

export function RecentlyViewedPlayers({
  excludeSlug,
  limit = 6,
  className,
}: RecentlyViewedPlayersProps) {
  const [players, setPlayers] = useState<RecentlyViewedPlayerEntry[]>([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    function loadPlayers() {
      void fetchRecentlyViewedPlayers({ limit, excludeSlug }).then(setPlayers);
    }

    loadPlayers();

    window.addEventListener("player-views-updated", loadPlayers);
    return () => {
      window.removeEventListener("player-views-updated", loadPlayers);
    };
  }, [excludeSlug, limit]);

  if (players.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Recently viewed</p>
        <button
          type="button"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          disabled={clearing}
          onClick={() => {
            setClearing(true);
            void clearRecentlyViewedPlayers().finally(() => setClearing(false));
          }}
        >
          Clear
        </button>
      </div>
      <ul className="flex gap-3 overflow-x-auto pb-1">
        {players.map((player) => (
          <li key={player.viewId} className="shrink-0">
            <Link
              href={player.href}
              className="flex w-28 flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:border-brand/40 hover:bg-white/[0.03]"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-full bg-white/10">
                {player.imageUrl ? (
                  <Image
                    src={player.imageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground/60">
                    {player.shortName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="w-full text-center">
                <p className="truncate text-sm font-medium text-foreground">
                  {player.shortName}
                </p>
                {player.clubName ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {player.clubName}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
