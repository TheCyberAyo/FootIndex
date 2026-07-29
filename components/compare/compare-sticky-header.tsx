import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { PlayerProfile } from "@/types/domain";

interface CompareStickyHeaderProps {
  haaland: PlayerProfile;
  mbappe: PlayerProfile;
  haalandWins: number;
  mbappeWins: number;
}

function PlayerChip({
  profile,
  wins,
  align,
}: {
  profile: PlayerProfile;
  wins: number;
  align: "left" | "right";
}) {
  const { player } = profile;

  return (
    <Link
      href={`/${player.slug}`}
      className={cn(
        "flex min-w-0 items-center gap-3",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5 sm:size-14">
        {player.image_url ? (
          <Image
            src={player.image_url}
            alt={player.name}
            fill
            sizes="56px"
            className="object-cover object-top"
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold text-white sm:text-lg">
          {player.short_name}
        </p>
        <p className="text-xs text-white/45">
          {wins} metric{wins === 1 ? "" : "s"} led
        </p>
      </div>
    </Link>
  );
}

/**
 * Sticky dual header — stays visible while scrolling metric rows.
 */
export function CompareStickyHeader({
  haaland,
  mbappe,
  haalandWins,
  mbappeWins,
}: CompareStickyHeaderProps) {
  return (
    <div className="sticky top-16 z-40 border-b border-glass-border bg-black/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6">
        <PlayerChip profile={haaland} wins={haalandWins} align="left" />
        <p className="font-display text-sm font-extrabold tracking-[0.2em] text-brand sm:text-base">
          VS
        </p>
        <PlayerChip profile={mbappe} wins={mbappeWins} align="right" />
      </div>
    </div>
  );
}
