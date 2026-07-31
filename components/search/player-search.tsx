"use client";

import { Loader2, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
import { PopularSearches } from "@/components/search/popular-searches";
import { RecentSearches } from "@/components/search/recent-searches";
import { RecentlyViewedPlayers } from "@/components/players/recently-viewed-players";
import { EmptyState } from "@/components/shared/empty-state";
import { GlassCard } from "@/components/shared/glass-card";
import { SearchFilters } from "@/components/search/search-filters";
import { Input } from "@/components/ui/input";
import { usePlayerSearch } from "@/hooks/use-player-search";
import { recordSearchClick } from "@/lib/search/session";
import {
  buildSearchPath,
  type PlayerSearchFilters,
} from "@/lib/search/filters";
import { cn } from "@/lib/utils";
import type { PlayerSearchResult } from "@/types/domain";

type PlayerSearchVariant = "hero" | "header" | "page" | "overlay";

interface PlayerSearchProps {
  variant?: PlayerSearchVariant;
  trending?: PlayerSearchResult[];
  popularSearches?: PlayerSearchResult[];
  initialQuery?: string;
  initialFilters?: PlayerSearchFilters;
  autoFocus?: boolean;
  className?: string;
  onClose?: () => void;
}

const PAGE_RESULTS_LIMIT = 25;

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
  overlay: {
    wrapper: "w-full",
    input: "h-11 rounded-xl pl-10 text-base",
    panel: "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(28rem,calc(100dvh-8rem))] overflow-y-auto rounded-xl border border-border bg-background shadow-xl",
  },
};

/**
 * Google-style player search with autocomplete (PROJECT_SPEC §55).
 */
export function PlayerSearch({
  variant = "page",
  trending = [],
  popularSearches = [],
  initialQuery = "",
  initialFilters,
  autoFocus = false,
  className,
  onClose,
}: PlayerSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<PlayerSearchFilters>(
    initialFilters ?? {},
  );
  const { query, setQuery, results, loading, error } = usePlayerSearch({
    limit: variant === "page" ? PAGE_RESULTS_LIMIT : undefined,
    filters,
  });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentRefreshKey, setRecentRefreshKey] = useState(0);
  const styles = VARIANT_STYLES[variant];
  const trimmedQuery = query.trim();
  const isPageVariant = variant === "page";
  const isDropdownVariant = variant === "header" || variant === "hero" || variant === "overlay";

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      if (isDropdownVariant) {
        setOpen(true);
      }
    }
  }, [initialQuery, isDropdownVariant, setQuery]);

  useEffect(() => {
    setFilters(initialFilters ?? {});
  }, [initialFilters]);

  useEffect(() => {
    if (!isPageVariant || pathname !== "/search") {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextPath = buildSearchPath({
        q: trimmedQuery.length >= 2 ? trimmedQuery : undefined,
        filters,
      });
      const currentPath = `${window.location.pathname}${window.location.search}`;

      if (currentPath !== nextPath) {
        router.replace(nextPath, { scroll: false });
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [filters, isPageVariant, pathname, router, trimmedQuery]);

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

  const trackSearch = useCallback(
    async (input: { searchTerm: string; playerId?: string }) => {
      await recordSearchClick(input);
      setRecentRefreshKey((key) => key + 1);
    },
    [],
  );

  const navigateToResult = useCallback(
    (result: PlayerSearchResult) => {
      close();
      void trackSearch({
        searchTerm: trimmedQuery || result.name,
        playerId: result.id,
      });
      onClose?.();
      router.push(result.href);
    },
    [close, onClose, router, trackSearch, trimmedQuery],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (activeIndex >= 0 && results[activeIndex]) {
      navigateToResult(results[activeIndex]);
      return;
    }

    if (results[0]) {
      navigateToResult(results[0]);
      return;
    }

    if (trimmedQuery.length >= 2) {
      close();
      void trackSearch({ searchTerm: trimmedQuery });
      router.push(buildSearchPath({ q: trimmedQuery, filters }));
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
      if (variant === "overlay") {
        onClose?.();
      }
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      navigateToResult(results[activeIndex]);
    }
  };

  const showDropdown =
    isDropdownVariant &&
    open &&
    (loading || error != null || trimmedQuery.length >= 2 || results.length > 0);

  const showPageResults = isPageVariant && trimmedQuery.length >= 2;

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
            aria-controls={
              showDropdown || showPageResults ? `${listboxId}-listbox` : undefined
            }
            aria-expanded={showDropdown || showPageResults}
            aria-autocomplete="list"
            role="combobox"
            className={styles.input}
            onChange={(event) => {
              setQuery(event.target.value);
              if (isDropdownVariant) {
                setOpen(true);
              }
              setActiveIndex(-1);
            }}
            onFocus={() => {
              if (isDropdownVariant) {
                setOpen(true);
              }
            }}
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
                if (isPageVariant && pathname === "/search") {
                  router.replace("/search", { scroll: false });
                }
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </form>

      {isPageVariant ? (
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          className="mt-4"
        />
      ) : null}

      {trending.length > 0 && variant === "hero" ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {trending.map((player) => (
            <button
              key={player.id}
              type="button"
              className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm transition-colors hover:border-brand/40 hover:text-white"
              onClick={() => {
                void recordSearchClick({
                  searchTerm: player.name,
                  playerId: player.id,
                });
                router.push(player.href);
              }}
            >
              {player.shortName}
            </button>
          ))}
        </div>
      ) : null}

      {showDropdown ? (
        <div
          id={`${listboxId}-listbox`}
          className={cn(
            styles.panel,
            variant === "header" || variant === "overlay" ? "" : "overflow-hidden",
          )}
        >
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-foreground/60">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Searching…
            </div>
          ) : error ? (
            <p className="px-4 py-4 text-sm text-destructive">{error}</p>
          ) : trimmedQuery.length < 2 ? (
            <p className="px-4 py-4 text-sm text-foreground/60">
              Type at least 2 characters to search.
            </p>
          ) : (
            <PlayerSearchResultsList
              results={results}
              activeIndex={activeIndex}
              onSelect={close}
              onPick={navigateToResult}
              emptyMessage={`No players found for “${trimmedQuery}”.`}
            />
          )}
        </div>
      ) : null}

      {isPageVariant && trimmedQuery.length < 2 ? (
        <>
          <RecentSearches
            refreshKey={recentRefreshKey}
          onSelect={(term) => {
            setQuery(term);
            if (pathname === "/search") {
              router.replace(
                buildSearchPath({ q: term, filters }),
                { scroll: false },
              );
            }
            inputRef.current?.focus();
          }}
          />
          <PopularSearches players={popularSearches} className="mt-4" />
          <RecentlyViewedPlayers />
        </>
      ) : null}

      {showPageResults ? (
        <div id={`${listboxId}-listbox`} className="mt-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Results for “{trimmedQuery}”
            </h2>
            {!loading && !error ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {results.length === 1
                  ? "1 player found"
                  : `${results.length} players found`}
              </p>
            ) : null}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-foreground/60">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Searching…
            </div>
          ) : error ? (
            <p className="py-8 text-sm text-destructive">{error}</p>
          ) : results.length === 0 ? (
            <EmptyState
              title="No players found"
              description={`No players found for “${trimmedQuery}”. Try a different name, club, or nationality.`}
            />
          ) : (
            <GlassCard className="overflow-hidden p-2">
              <PlayerSearchResultsList
                results={results}
                onPick={navigateToResult}
                emptyMessage={`No players found for “${trimmedQuery}”.`}
              />
            </GlassCard>
          )}
        </div>
      ) : null}
    </div>
  );
}
