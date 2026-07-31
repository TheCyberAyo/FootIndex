"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SEARCH_POSITION_OPTIONS,
} from "@/lib/search/filters";
import {
  buildRankingQueryString,
  hasActiveRankingFilters,
  type RankingFilters,
} from "@/lib/rankings/filters";

interface RankingsFilterPanelProps {
  initialFilters: RankingFilters;
}

export function RankingsFilterPanel({
  initialFilters,
}: RankingsFilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<RankingFilters>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  function applyFilters(next: RankingFilters) {
    setFilters(next);
    const query = buildRankingQueryString(next);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="mb-6 space-y-3 rounded-xl border border-border bg-card/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Filter leaderboard</p>
        {hasActiveRankingFilters(filters) ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyFilters({})}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Position</span>
          <select
            value={filters.position ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              applyFilters({
                ...filters,
                position: value
                  ? (value as RankingFilters["position"])
                  : undefined,
              });
            }}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="">Any position</option>
            {SEARCH_POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Nationality</span>
          <Input
            defaultValue={filters.nationality ?? ""}
            placeholder="e.g. Brazil"
            onBlur={(event) => {
              const value = event.target.value.trim();
              applyFilters({
                ...filters,
                nationality: value || undefined,
              });
            }}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Competition</span>
          <Input
            defaultValue={filters.competition ?? ""}
            placeholder="e.g. La Liga"
            onBlur={(event) => {
              const value = event.target.value.trim();
              applyFilters({
                ...filters,
                competition: value || undefined,
              });
            }}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Season</span>
          <Input
            defaultValue={filters.season ?? ""}
            placeholder="e.g. 2024"
            inputMode="numeric"
            onBlur={(event) => {
              const value = event.target.value.trim();
              applyFilters({
                ...filters,
                season: /^\d{4}$/.test(value) ? value : undefined,
              });
            }}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Min age</span>
          <Input
            type="number"
            min={15}
            max={45}
            defaultValue={filters.ageMin ?? ""}
            placeholder="18"
            onBlur={(event) => {
              const value = event.target.value.trim();
              applyFilters({
                ...filters,
                ageMin: value ? Number(value) : undefined,
              });
            }}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Max age</span>
          <Input
            type="number"
            min={15}
            max={45}
            defaultValue={filters.ageMax ?? ""}
            placeholder="35"
            onBlur={(event) => {
              const value = event.target.value.trim();
              applyFilters({
                ...filters,
                ageMax: value ? Number(value) : undefined,
              });
            }}
          />
        </label>
      </div>
    </div>
  );
}
