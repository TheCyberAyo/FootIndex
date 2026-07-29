"use client";

import { Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { PlayerSearchResultsList } from "@/components/search/player-search-result";
import { Input } from "@/components/ui/input";
import { usePlayerSearch } from "@/hooks/use-player-search";
import { cn } from "@/lib/utils";
import type { PlayerSearchResult } from "@/types/domain";

type PlayerSearchVariant = "hero" | "header" | "page";

interface PlayerSearchProps {
  variant?: PlayerSearchVariant;
  trending?: PlayerSearchResult[];
  initialQuery?: string;
  autoFocus?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<
  PlayerSearchVariant,
  { input: string; panel: string; wrapper: string }
> = {
  hero: {
    wrapper: "w-full max-w-2xl",
    input: "h-14 rounded-2xl border-white/20 bg-black/50 px-12 text-lg backdrop-blur-md",
    panel: "mt-2 rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl",
  },
  header: {
    wrapper: "hidden w-full max-w-xs lg:block",
    input: "h-10 rounded-xl bg-background/80 pl-10 text-sm",
    panel: "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-border bg-background/95 backdrop-blur-xl shadow-xl",
  },
  page: {
    wrapper: "w-full max-w-3xl",
    input: "h-14 rounded-2xl px-12 text-lg",
    panel: "mt-3 rounded-2xl border border-border bg-background/95 backdrop-blur-xl",
  },
};

/**
 * Google-style player search with autocomplete (PROJECT_SPEC §55).
 */
export function PlayerSearch({
  variant = "page",
  trending = [],
  initialQuery = "",
  autoFocus = false,
  className,
}: PlayerSearchProps) {
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { query, setQuery, results, loading, error } = usePlayerSearch();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const styles = VARIANT_STYLES[variant];

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setOpen(true);
    }
  }, [initialQuery, setQuery]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [close]);

  const navigateToResult = useCallback(
    (result: PlayerSearchResult) => {
      close();
      router.push(result.href);
    },
    [close, router],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();

    if (activeIndex >= 0 && results[activeIndex]) {
      navigateToResult(results[activeIndex]);
      return;
    }

    if (results[0]) {
      navigateToResult(results[0]);
      return;
    }

    if (trimmed.length >= 2) {
      close();
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        index < results.length - 1 ? index + 1 : index,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index > 0 ? index - 1 : -1));
      return;
    }

    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      navigateToResult(results[activeIndex]);
    }
  };

  const showPanel =
    open && (loading || error != null || query.trim().length >= 2 || results.length > 0);

  return (
    <div ref={containerRef} className={cn("relative", styles.wrapper, className)}>
      <form onSubmit={handleSubmit} role="search">
        <label className="sr-only" htmlFor={`${listboxId}-input`}>
          Search football players
        </label>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45"
          />
          <Input
            ref={inputRef}
            id={`${listboxId}-input`}
            type="search"
            value={query}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search any football player…"
            aria-controls={showPanel ? `${listboxId}-listbox` : undefined}
            aria-expanded={showPanel}
            aria-autocomplete="list"
            role="combobox"
            className={styles.input}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-foreground/50 hover:bg-white/10 hover:text-foreground"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </form>

      {trending.length > 0 && variant === "hero" ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {trending.map((player) => (
            <button
              key={player.id}
              type="button"
              className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm transition-colors hover:border-brand/40 hover:text-white"
              onClick={() => router.push(player.href)}
            >
              {player.shortName}
            </button>
          ))}
        </div>
      ) : null}

      {showPanel ? (
        <div
          id={`${listboxId}-listbox`}
          className={cn(styles.panel, variant === "header" ? "" : "overflow-hidden")}
        >
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-foreground/60">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Searching…
            </div>
          ) : error ? (
            <p className="px-4 py-4 text-sm text-destructive">{error}</p>
          ) : query.trim().length < 2 ? (
            <p className="px-4 py-4 text-sm text-foreground/60">
              Type at least 2 characters to search.
            </p>
          ) : (
            <PlayerSearchResultsList
              results={results}
              activeIndex={activeIndex}
              onSelect={close}
              emptyMessage={`No players found for “${query.trim()}”.`}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
