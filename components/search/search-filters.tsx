"use client";

import { X } from "lucide-react";

import type { PlayerSearchFilters } from "@/lib/search/filters";
import {
  SEARCH_POSITION_OPTIONS,
  clearSearchFilters,
  searchFilterChipLabels,
} from "@/lib/search/filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  filters: PlayerSearchFilters;
  onChange: (filters: PlayerSearchFilters) => void;
  className?: string;
}

export function SearchFilters({
  filters,
  onChange,
  className,
}: SearchFiltersProps) {
  const chips = searchFilterChipLabels(filters);

  function removeFilter(key: keyof PlayerSearchFilters) {
    const next = { ...filters };
    if (key === "ageMin" || key === "ageMax") {
      delete next.ageMin;
      delete next.ageMax;
    } else {
      delete next[key];
    }
    onChange(next);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Position</span>
          <select
            value={filters.position ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onChange({
                ...filters,
                position: value ? (value as PlayerSearchFilters["position"]) : undefined,
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
            value={filters.nationality ?? ""}
            placeholder="e.g. Norway"
            onChange={(event) => {
              const value = event.target.value.trim();
              onChange({
                ...filters,
                nationality: value || undefined,
              });
            }}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Club</span>
          <Input
            value={filters.club ?? ""}
            placeholder="e.g. Manchester City"
            onChange={(event) => {
              const value = event.target.value.trim();
              onChange({
                ...filters,
                club: value || undefined,
              });
            }}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Competition</span>
          <Input
            value={filters.competition ?? ""}
            placeholder="e.g. Premier League"
            onChange={(event) => {
              const value = event.target.value.trim();
              onChange({
                ...filters,
                competition: value || undefined,
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
            value={filters.ageMin ?? ""}
            placeholder="18"
            onChange={(event) => {
              const value = event.target.value.trim();
              onChange({
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
            value={filters.ageMax ?? ""}
            placeholder="35"
            onChange={(event) => {
              const value = event.target.value.trim();
              onChange({
                ...filters,
                ageMax: value ? Number(value) : undefined,
              });
            }}
          />
        </label>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground/80"
              onClick={() => removeFilter(chip.key)}
            >
              {chip.label}
              <X className="size-3" aria-hidden="true" />
            </button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onChange(clearSearchFilters())}
          >
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
