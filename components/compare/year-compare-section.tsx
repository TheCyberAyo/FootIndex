"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CompareMetricsTable } from "@/components/compare/compare-metrics-table";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import {
  buildDynamicInternationalYearMetrics,
  buildDynamicSeasonCompareMetrics,
  buildDynamicSeasonRows,
  buildSeasonCompareShareUrl,
  formatDynamicSeasonClub,
  resolveDynamicSeasonKey,
  searchDynamicYearCompare,
} from "@/lib/compare/season-compare";
import { cn } from "@/lib/utils";
import type { PlayerProfile } from "@/types/domain";

interface YearCompareSectionProps {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
  comparePath: string;
  initialSeason?: string | null;
  initialYear?: string | null;
}

/**
 * Searchable season / calendar-year compare from synced season_stats for any pair.
 */
export function YearCompareSection({
  playerOne,
  playerTwo,
  comparePath,
  initialSeason = null,
  initialYear = null,
}: YearCompareSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const allRows = buildDynamicSeasonRows(playerOne, playerTwo);
  const playerOneName = playerOne.player.short_name;
  const playerTwoName = playerTwo.player.short_name;

  const [query, setQuery] = useState(initialYear ?? initialSeason ?? "");
  const deferredQuery = useDeferredValue(query);
  const [selectedSeason, setSelectedSeason] = useState(() =>
    resolveDynamicSeasonKey(allRows, initialSeason, initialYear),
  );
  const [copied, setCopied] = useState(false);

  const { seasons, calendarYear, international } = searchDynamicYearCompare(
    playerOne,
    playerTwo,
    deferredQuery,
  );
  const selectedRow =
    seasons.find((row) => row.season === selectedSeason) ??
    allRows.find((row) => row.season === selectedSeason) ??
    null;
  const seasonMetrics = selectedRow
    ? buildDynamicSeasonCompareMetrics(selectedRow)
    : [];
  const intlMetrics =
    calendarYear != null && international
      ? buildDynamicInternationalYearMetrics(
          calendarYear,
          international.playerOne,
          international.playerTwo,
        )
      : [];

  useEffect(() => {
    if (seasons.length === 0) {
      return;
    }
    if (!seasons.some((row) => row.season === selectedSeason)) {
      setSelectedSeason(seasons[0].season);
    }
  }, [seasons, selectedSeason]);

  function updateUrl(season: string, yearQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", season);
    if (/^(19|20)\d{2}$/.test(yearQuery.trim())) {
      params.set("year", yearQuery.trim());
    } else {
      params.delete("year");
    }
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}#by-year` : `${pathname}#by-year`, {
      scroll: false,
    });
  }

  function selectSeason(season: string) {
    setSelectedSeason(season);
    updateUrl(season, query);
  }

  async function copyShareLink() {
    if (!selectedSeason) {
      return;
    }
    const relative = buildSeasonCompareShareUrl(
      comparePath,
      selectedSeason,
      calendarYear != null ? String(calendarYear) : query,
    );
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${relative}`
        : relative;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const seasonTabs = deferredQuery ? seasons : allRows;

  return (
    <Section
      id="by-year"
      eyebrow="By year"
      title="Season & year compare"
      description="Search a year (2023), season (2022-2023), or club. Club totals are per football season; country goals appear when you search a calendar year."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="year-compare-search">
          Search year or season
        </label>
        <input
          id="year-compare-search"
          type="search"
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            const next = searchDynamicYearCompare(playerOne, playerTwo, value);
            if (next.seasons[0]) {
              setSelectedSeason(next.seasons[0].season);
              updateUrl(next.seasons[0].season, value);
            }
          }}
          placeholder="Search year, season, or club…"
          className="h-11 w-full rounded-xl border border-input bg-background/80 px-4 text-sm text-foreground outline-none backdrop-blur-sm placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/30 sm:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {seasonTabs.length} season{seasonTabs.length === 1 ? "" : "s"} · synced
            stats
          </p>
          {selectedSeason ? (
            <Button type="button" size="sm" variant="outline" onClick={copyShareLink}>
              {copied ? "Link copied" : "Share this season"}
            </Button>
          ) : null}
        </div>
      </div>

      {allRows.length === 0 ? (
        <p className="rounded-2xl border border-glass-border bg-glass px-4 py-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
          No season-by-season club data yet for this pair. Sync players from admin
          to populate season stats.
        </p>
      ) : (
        <>
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
            {seasonTabs.map((row) => {
              const active = row.season === selectedSeason;
              return (
                <Button
                  key={row.season}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => selectSeason(row.season)}
                  className={cn(
                    "shrink-0",
                    active && "bg-brand text-black hover:bg-brand/90",
                  )}
                >
                  {row.season}
                </Button>
              );
            })}
          </div>

          {seasons.length === 0 ? (
            <p className="rounded-2xl border border-glass-border bg-glass px-4 py-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
              No seasons match “{query}”. Try a year, season label, or club name.
            </p>
          ) : selectedRow ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-glass-border bg-glass px-4 py-4 backdrop-blur-xl">
                  <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    {playerOneName} · {selectedRow.season}
                  </p>
                  <p className="mt-2 font-display text-lg font-bold text-foreground">
                    {formatDynamicSeasonClub(selectedRow.playerOne)}
                  </p>
                </div>
                <div className="rounded-2xl border border-glass-border bg-glass px-4 py-4 backdrop-blur-xl">
                  <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    {playerTwoName} · {selectedRow.season}
                  </p>
                  <p className="mt-2 font-display text-lg font-bold text-foreground">
                    {formatDynamicSeasonClub(selectedRow.playerTwo)}
                  </p>
                </div>
              </div>

              <CompareMetricsTable
                metrics={seasonMetrics}
                playerOneName={playerOneName}
                playerTwoName={playerTwoName}
              />

              {calendarYear != null && international ? (
                <div className="space-y-3">
                  <p className="text-xs tracking-[0.18em] text-brand uppercase">
                    Country · calendar {calendarYear}
                  </p>
                  <CompareMetricsTable
                    metrics={intlMetrics}
                    playerOneName={playerOneName}
                    playerTwoName={playerTwoName}
                  />
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  Tip: search a calendar year (e.g. 2023) to compare international
                  goals for that year.
                </p>
              )}
            </div>
          ) : null}
        </>
      )}
    </Section>
  );
}
