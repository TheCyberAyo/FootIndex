"use client";

import { useQuery } from "@tanstack/react-query";

import type { CareerStats, LiveScoreCard, Match, SeasonStats } from "@/types/domain";

interface MatchesApiResponse {
  dataSource: string;
  hasLive: boolean;
  matches: Match[];
  liveCards: LiveScoreCard[];
  revalidateSeconds: number;
}

interface StatsApiResponse {
  dataSource: string;
  haaland: {
    player: {
      id: string;
      slug: string;
      name: string;
      imageUrl: string | null;
      club: string | null;
    };
    career: CareerStats | null;
    seasons: SeasonStats[];
  };
  mbappe: {
    player: {
      id: string;
      slug: string;
      name: string;
      imageUrl: string | null;
      club: string | null;
    };
    career: CareerStats | null;
    seasons: SeasonStats[];
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Polls /api/matches — faster while any match is live (Phase 3 decision).
 */
export function useLiveMatches(initialHasLive = false) {
  return useQuery({
    queryKey: ["matches", "live"],
    queryFn: () => fetchJson<MatchesApiResponse>("/api/matches"),
    staleTime: initialHasLive ? 15_000 : 60_000,
    refetchInterval: (query) =>
      query.state.data?.hasLive ? 15_000 : 60_000,
  });
}

export function usePlayerStats() {
  return useQuery({
    queryKey: ["stats", "comparison"],
    queryFn: () => fetchJson<StatsApiResponse>("/api/stats"),
    staleTime: 60_000,
  });
}
