import { isSupabaseConfigured } from "@/lib/env";
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
    const supabase = createSupabasePublicClient();

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

export async function listRecentSearchTerms(input: {
  userId?: string | null;
  sessionId?: string | null;
  limit?: number;
}): Promise<string[]> {
  const entries = await listRecentSearches(input);
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const entry of entries) {
    const key = entry.searchTerm.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    terms.push(entry.searchTerm);
  }

  return terms.slice(0, input.limit ?? 5);
}
