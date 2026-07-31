import { unstable_cache } from "next/cache";

import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import {
  dedupeSearchHistoryEntries,
  isWithinDedupeWindow,
  SEARCH_HISTORY_DEDUPE_WINDOW_MS,
} from "@/lib/search/dedupe-entries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export interface SearchHistoryEntry {
  id: string;
  searchTerm: string;
  playerId: string | null;
  playerSlug: string | null;
  playerName: string | null;
  createdAt: string;
}

async function hasRecentDuplicateSearch(input: {
  searchTerm: string;
  userId?: string | null;
  sessionId?: string | null;
}): Promise<boolean> {
  if (!input.userId && !input.sessionId) {
    return false;
  }

  const supabase = createSupabaseAdminClient();
  const since = new Date(
    Date.now() - SEARCH_HISTORY_DEDUPE_WINDOW_MS,
  ).toISOString();

  let query = supabase
    .from("search_history")
    .select("id, created_at")
    .eq("search_term", input.searchTerm)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1);

  if (input.userId) {
    query = query.eq("user_id", input.userId);
  } else if (input.sessionId) {
    query = query.eq("session_id", input.sessionId);
  }

  const result = await query.maybeSingle();
  if (result.error || !result.data) {
    return false;
  }

  return isWithinDedupeWindow(result.data.created_at);
}

export async function recordSearchHistory(input: {
  searchTerm: string;
  playerId?: string | null;
  userId?: string | null;
  sessionId?: string | null;
}): Promise<void> {
  const term = input.searchTerm.trim();
  if (term.length < 2 || !isSupabaseConfigured()) {
    return;
  }

  try {
    const isDuplicate = await hasRecentDuplicateSearch({
      searchTerm: term,
      userId: input.userId,
      sessionId: input.sessionId,
    });

    if (isDuplicate) {
      return;
    }

    const supabase = createSupabaseAdminClient();
    await supabase.from("search_history").insert({
      search_term: term,
      player_id: input.playerId ?? null,
      user_id: input.userId ?? null,
      session_id: input.sessionId ?? null,
    });
  } catch {
    // History table optional until migration is applied.
  }
}

export async function listRecentSearches(input: {
  userId?: string | null;
  sessionId?: string | null;
  limit?: number;
}): Promise<SearchHistoryEntry[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const limit = Math.max(1, Math.min(input.limit ?? 8, 20));
  try {
    // Session and user reads use admin — verified userId/sessionId come from route handlers.
    const supabase =
      (input.sessionId || input.userId) && isSupabaseAdminConfigured()
        ? createSupabaseAdminClient()
        : createSupabasePublicClient();

    let query = supabase
      .from("search_history")
      .select(
        "id, search_term, player_id, created_at, player:players(slug, name)",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (input.userId) {
      query = query.eq("user_id", input.userId);
    } else if (input.sessionId) {
      query = query.eq("session_id", input.sessionId);
    } else {
      return [];
    }

    const result = await query;
    if (result.error) {
      return [];
    }

    return (result.data ?? []).map((row) => {
      const player = Array.isArray(row.player) ? row.player[0] : row.player;
      return {
        id: row.id,
        searchTerm: row.search_term,
        playerId: row.player_id,
        playerSlug: player?.slug ?? null,
        playerName: player?.name ?? null,
        createdAt: row.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function listRecentSearchEntries(input: {
  userId?: string | null;
  sessionId?: string | null;
  limit?: number;
}): Promise<SearchHistoryEntry[]> {
  const entries = await listRecentSearches(input);
  return dedupeSearchHistoryEntries(entries, input.limit ?? 5);
}

export async function listRecentSearchTerms(input: {
  userId?: string | null;
  sessionId?: string | null;
  limit?: number;
}): Promise<string[]> {
  const entries = await listRecentSearchEntries(input);
  return entries.map((entry) => entry.searchTerm);
}

export async function clearSearchHistory(input: {
  userId?: string | null;
  sessionId?: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  if (!input.userId && !input.sessionId) {
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();

    if (input.userId) {
      await supabase.from("search_history").delete().eq("user_id", input.userId);
      return;
    }

    if (input.sessionId) {
      await supabase
        .from("search_history")
        .delete()
        .eq("session_id", input.sessionId);
    }
  } catch {
    // History table optional until migration is applied.
  }
}

export async function mergeSessionSearchHistory(input: {
  sessionId: string;
  userId: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("search_history")
      .update({ user_id: input.userId, session_id: null })
      .eq("session_id", input.sessionId)
      .is("user_id", null);
  } catch {
    // History table optional until migration is applied.
  }
}

const MOST_SEARCHED_WINDOW_DAYS = 30;
const MOST_SEARCHED_SAMPLE_LIMIT = 2000;

export interface MostSearchedPlayerRow {
  playerId: string;
  searchCount: number;
}

async function listMostSearchedPlayerIdsUncached(input: {
  limit?: number;
  windowDays?: number;
}): Promise<MostSearchedPlayerRow[]> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return [];
  }

  const limit = Math.max(1, Math.min(input.limit ?? 9, 20));
  const windowDays = Math.max(1, Math.min(input.windowDays ?? MOST_SEARCHED_WINDOW_DAYS, 90));
  const since = new Date(Date.now() - windowDays * 86_400_000).toISOString();

  try {
    const supabase = createSupabaseAdminClient();
    const result = await supabase
      .from("search_history")
      .select("player_id")
      .not("player_id", "is", null)
      .gte("created_at", since)
      .limit(MOST_SEARCHED_SAMPLE_LIMIT);

    if (result.error || !result.data?.length) {
      return [];
    }

    const counts = new Map<string, number>();
    for (const row of result.data) {
      if (!row.player_id) {
        continue;
      }
      counts.set(row.player_id, (counts.get(row.player_id) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, limit)
      .map(([playerId, searchCount]) => ({ playerId, searchCount }));
  } catch {
    return [];
  }
}

export async function listMostSearchedPlayerIds(input: {
  limit?: number;
  windowDays?: number;
} = {}): Promise<MostSearchedPlayerRow[]> {
  const limit = Math.max(1, Math.min(input.limit ?? 9, 20));
  const windowDays = Math.max(1, Math.min(input.windowDays ?? MOST_SEARCHED_WINDOW_DAYS, 90));

  return unstable_cache(
    () => listMostSearchedPlayerIdsUncached({ limit, windowDays }),
    ["most-searched-players", String(limit), String(windowDays)],
    { revalidate: 300 },
  )();
}
