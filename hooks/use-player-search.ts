"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PlayerSearchResult } from "@/types/domain";

interface UsePlayerSearchOptions {
  debounceMs?: number;
  limit?: number;
}

export function usePlayerSearch({
  debounceMs = 200,
  limit,
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
  }, [query, debounceMs, limit]);

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
