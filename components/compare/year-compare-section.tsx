"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CompareMetricRow } from "@/components/compare/compare-metric-row";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import {
  buildInternationalYearMetrics,
  buildSeasonCompareMetrics,
  formatSeasonClub,
  getSeasonRow,
  resolveSeasonKey,
  searchYearCompare,
  SEASON_COMPARE_ROWS,
} from "@/lib/compare/by-year";
import { SEASON_BASELINE_AS_OF } from "@/lib/data/season-baselines";
import { cn } from "@/lib/utils";

interface YearCompareSectionProps {
  initialSeason?: string | null;
  initialYear?: string | null;
}

/**
 * Searchable season / calendar-year compare — curated baselines (Free plan).
 */
export function YearCompareSection({
  initialSeason = null,
  initialYear = null,
}: YearCompareSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialYear ?? initialSeason ?? "");
  const deferredQuery = useDeferredValue(query);
  const [selectedSeason, setSelectedSeason] = useState(() =>
    resolveSeasonKey(initialSeason, initialYear),
  );

  const { seasons, calendarYear, international } =
    searchYearCompare(deferredQuery);
  const selectedRow = getSeasonRow(selectedSeason);
  const seasonMetrics = selectedRow
    ? buildSeasonCompareMetrics(selectedRow)
    : [];
  const intlMetrics =
    calendarYear != null ? buildInternationalYearMetrics(calendarYear) : [];

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
            const next = searchYearCompare(value);
            if (next.seasons[0]) {
              setSelectedSeason(next.seasons[0].season);
              updateUrl(next.seasons[0].season, value);
            }
          }}
          placeholder="Search year, season, or club…"
          className="h-11 w-full rounded-xl border border-glass-border bg-glass px-4 text-sm text-white outline-none backdrop-blur-xl placeholder:text-white/35 focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/30 sm:max-w-md"
        />
        <p className="text-xs text-white/35">
          {seasons.length} season{seasons.length === 1 ? "" : "s"} · curated{" "}
          {SEASON_BASELINE_AS_OF}
        </p>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
        {(deferredQuery ? seasons : SEASON_COMPARE_ROWS).map((row) => {
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
        <p className="rounded-2xl border border-glass-border bg-glass px-4 py-8 text-center text-sm text-white/50 backdrop-blur-xl">
          No seasons match “{query}”. Try 2023, 2022-2023, or Dortmund.
        </p>
      ) : selectedRow ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-glass-border bg-glass px-4 py-4 backdrop-blur-xl">
              <p className="text-xs tracking-[0.18em] text-white/45 uppercase">
                Haaland · {selectedRow.season}
              </p>
              <p className="mt-2 font-display text-lg font-bold text-white">
                {formatSeasonClub(selectedRow.haaland)}
              </p>
            </div>
            <div className="rounded-2xl border border-glass-border bg-glass px-4 py-4 backdrop-blur-xl">
              <p className="text-xs tracking-[0.18em] text-white/45 uppercase">
                Mbappé · {selectedRow.season}
              </p>
              <p className="mt-2 font-display text-lg font-bold text-white">
                {formatSeasonClub(selectedRow.mbappe)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {seasonMetrics.map((metric) => (
              <CompareMetricRow key={metric.key} metric={metric} />
            ))}
          </div>

          {calendarYear != null && international ? (
            <div className="space-y-3">
              <p className="text-xs tracking-[0.18em] text-brand uppercase">
                Country · calendar {calendarYear}
              </p>
              {intlMetrics.map((metric) => (
                <CompareMetricRow key={metric.key} metric={metric} />
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-white/35">
              Tip: search a calendar year (e.g. 2023) to compare international
              goals for that year.
            </p>
          )}
        </div>
      ) : null}
    </Section>
  );
}
