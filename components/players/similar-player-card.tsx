"use client";

import Image from "next/image";

import { PrefetchLink } from "@/components/shared/prefetch-link";
import { Button } from "@/components/ui/button";
import type { SimilarPlayerResult } from "@/services/players/similar-players.service";

interface SimilarPlayerCardProps {
  player: SimilarPlayerResult;
}

export function SimilarPlayerCard({ player }: SimilarPlayerCardProps) {
  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
      <div className="flex items-center gap-3">
        {player.imageUrl ? (
          <Image
            src={player.imageUrl}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm text-white/60">
            {player.shortName.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <PrefetchLink
            href={player.href}
            className="truncate font-medium text-white hover:text-brand"
          >
            {player.name}
          </PrefetchLink>
          <p className="text-xs text-white/50">
            {player.positionLabel}
            {player.clubName ? ` · ${player.clubName}` : ""}
          </p>
        </div>
      </div>

      {player.matchReasons.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {player.matchReasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60"
            >
              {reason}
            </span>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-sm text-white/55">
        {player.careerGoals > 0 ? `${player.careerGoals} career goals` : player.nationality}
        {player.competition ? ` · ${player.competition}` : ""}
      </p>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="mt-4 border-white/15 bg-transparent text-white hover:bg-white/10"
      >
        <PrefetchLink href={player.compareHref}>Compare stats</PrefetchLink>
      </Button>
    </li>
  );
}
