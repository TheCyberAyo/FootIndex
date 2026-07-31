"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PlayerSearchFilters } from "@/lib/search/filters";
import { recordSearchQuery } from "@/lib/search/session";
import type { PlayerSearchResult } from "@/types/domain";

interface UsePlayerSearchOptions {
  debounceMs?: number;
  limit?: number;
  filters?: PlayerSearchFilters;
}

export function usePlayerSearch({
  debounceMs = 200,
  limit,
  filters,
}: UsePlayerSearchOptions = {}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ q: trimmed });
        if (limit != null) {
          params.set("limit", String(limit));
        }
        if (filters?.position) {
          params.set("position", filters.position);
        }
        if (filters?.nationality) {
          params.set("nationality", filters.nationality);
        }
        if (filters?.club) {
          params.set("club", filters.club);
        }
        if (filters?.competition) {
          params.set("competition", filters.competition);
        }
        if (filters?.ageMin != null) {
          params.set("ageMin", String(filters.ageMin));
        }
        if (filters?.ageMax != null) {
          params.set("ageMax", String(filters.ageMax));
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const payload = (await response.json()) as {
          results?: PlayerSearchResult[];
        };
        setResults(payload.results ?? []);
        void recordSearchQuery(trimmed);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setError("Could not load results. Try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, debounceMs, limit, filters]);

  const reset = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    reset,
  };
}
