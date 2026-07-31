import Link from "next/link";

import { PlayerSearchResultsList } from "@/components/search/player-search-result";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlayersCatalogPage } from "@/services/players/players-catalog.service";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface PlayersCatalogProps {
  catalog: PlayersCatalogPage;
}

function buildPlayersPath(page: number, letter: string | null): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (letter) {
    params.set("letter", letter);
  }
  return `/players?${params.toString()}`;
}

export function PlayersCatalog({ catalog }: PlayersCatalogProps) {
  return (
    <div className="space-y-6">
      <nav aria-label="Browse by letter" className="flex flex-wrap gap-2">
        <Link
          href={buildPlayersPath(1, null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            catalog.letter
              ? "border-border hover:border-brand/40"
              : "border-brand/40 bg-brand/10 text-brand",
          )}
        >
          All
        </Link>
        {ALPHABET.map((letter) => (
          <Link
            key={letter}
            href={buildPlayersPath(1, letter)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              catalog.letter === letter
                ? "border-brand/40 bg-brand/10 text-brand"
                : "border-border hover:border-brand/40",
            )}
          >
            {letter}
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          {catalog.total === 1
            ? "1 player"
            : `${catalog.total.toLocaleString()} players`}
          {catalog.letter ? ` starting with “${catalog.letter}”` : ""}
        </p>
        <p>
          Page {catalog.page} of {catalog.totalPages}
        </p>
      </div>

      {catalog.players.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No players found for this letter.
        </p>
      ) : (
        <GlassCard className="overflow-hidden p-2">
          <PlayerSearchResultsList results={catalog.players} />
        </GlassCard>
      )}

      {catalog.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          {catalog.page > 1 ? (
            <Button asChild variant="outline">
              <Link href={buildPlayersPath(catalog.page - 1, catalog.letter)}>
                Previous
              </Link>
            </Button>
          ) : (
            <span />
          )}

          {catalog.page < catalog.totalPages ? (
            <Button asChild variant="outline">
              <Link href={buildPlayersPath(catalog.page + 1, catalog.letter)}>
                Next
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
