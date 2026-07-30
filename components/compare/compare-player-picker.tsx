"use client";

import { Loader2, Search, UserRoundPen } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { PlayerSearchResultsList } from "@/components/search/player-search-result";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlayerSearch } from "@/hooks/use-player-search";
import { replaceComparePlayerPath } from "@/lib/compare/paths";
import type { PlayerSearchResult } from "@/types/domain";

interface ComparePlayerPickerProps {
  playerOneSlug: string;
  playerOneName: string;
  playerOneImageUrl?: string | null;
  playerTwoSlug: string;
  playerTwoName: string;
  playerTwoImageUrl?: string | null;
}

interface ComparePlayerSlotProps {
  side: "playerOne" | "playerTwo";
  label: string;
  slug: string;
  imageUrl?: string | null;
  excludeSlug: string;
  onPick: (side: "playerOne" | "playerTwo", slug: string) => void;
}

function ComparePlayerSlot({
  side,
  label,
  slug,
  imageUrl,
  excludeSlug,
  onPick,
}: ComparePlayerSlotProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const { query, setQuery, results, loading, error, reset } = usePlayerSearch({
    limit: 15,
  });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredResults = results.filter(
    (result) => result.slug !== excludeSlug,
  );

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    reset();
  }, [reset]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [close]);

  function pickResult(result: PlayerSearchResult) {
    onPick(side, result.slug);
    close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(index + 1, filteredResults.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && filteredResults[activeIndex]) {
      event.preventDefault();
      pickResult(filteredResults[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      close();
    }
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <div className="mb-2 flex items-center gap-3">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="40px"
              className="object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
              {label.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-foreground">
            {label}
          </p>
          <p className="text-caption text-muted-foreground">/{slug}</p>
        </div>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={`Replace ${label}…`}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className="pl-10"
        />
        {loading ? (
          <Loader2
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {open && query.trim().length >= 2 ? (
        <div
          id={listboxId}
          className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-background/95 shadow-lg backdrop-blur-xl"
          role="listbox"
        >
          {error ? (
            <p className="px-3 py-4 text-sm text-destructive">{error}</p>
          ) : (
            <PlayerSearchResultsList
              results={filteredResults}
              activeIndex={activeIndex}
              onPick={pickResult}
              emptyMessage={
                results.length > 0 && filteredResults.length === 0
                  ? `${label} is already the other player in this comparison.`
                  : `No players found for “${query.trim()}”.`
              }
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Swap either side of a compare page — navigates to canonical /compare/[a]/[b].
 * Server still renders each pair; this is a client navigation island only.
 */
export function ComparePlayerPicker({
  playerOneSlug,
  playerOneName,
  playerOneImageUrl,
  playerTwoSlug,
  playerTwoName,
  playerTwoImageUrl,
}: ComparePlayerPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPair = useCallback(
    (side: "playerOne" | "playerTwo", newSlug: string) => {
      const path = replaceComparePlayerPath(
        playerOneSlug,
        playerTwoSlug,
        side,
        newSlug,
      );

      if (!path) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.delete("season");
      params.delete("year");
      const query = params.toString();
      router.push(query ? `${path}?${query}` : path);
    },
    [playerOneSlug, playerTwoSlug, router, searchParams],
  );

  return (
    <section
      id="change-players"
      className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8"
    >
      <GlassCard className="overflow-visible p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-caption tracking-[0.18em] text-brand uppercase">
              Change comparison
            </p>
            <h2 className="mt-1 font-display text-h3 text-foreground">
              Pick any two players
            </h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Search to replace either side. Haaland vs Mbappé stays the default
              entry — every pair gets its own shareable URL.
            </p>
          </div>
          <UserRoundPen
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-start">
          <ComparePlayerSlot
            side="playerOne"
            label={playerOneName}
            slug={playerOneSlug}
            imageUrl={playerOneImageUrl}
            excludeSlug={playerTwoSlug}
            onPick={navigateToPair}
          />

          <div className="hidden items-center justify-center pt-10 md:flex">
            <span className="font-display text-sm font-extrabold tracking-[0.2em] text-brand">
              VS
            </span>
          </div>

          <ComparePlayerSlot
            side="playerTwo"
            label={playerTwoName}
            slug={playerTwoSlug}
            imageUrl={playerTwoImageUrl}
            excludeSlug={playerOneSlug}
            onPick={navigateToPair}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigateToPair("playerOne", "haaland")}
            disabled={playerOneSlug === "haaland" || playerTwoSlug === "haaland"}
          >
            Set Haaland
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigateToPair("playerTwo", "mbappe")}
            disabled={playerOneSlug === "mbappe" || playerTwoSlug === "mbappe"}
          >
            Set Mbappé
          </Button>
        </div>
      </GlassCard>
    </section>
  );
}
