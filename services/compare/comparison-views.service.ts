import { canonicalComparePlayerIds } from "@/services/votes/comparison-votes.service";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { comparePath } from "@/lib/compare/paths";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PlayerProfile } from "@/types/domain";

export type ComparisonViewPair = {
  playerOneId: string;
  playerTwoId: string;
  playerOneSlug: string;
  playerTwoSlug: string;
  playerOneName: string;
  playerTwoName: string;
  viewCount: number;
  lastViewedAt: string;
  href: string;
};

interface ComparisonViewPlayerRow {
  slug: string;
  name: string;
}

interface ComparisonViewQueryRow {
  player_one_id: string;
  player_two_id: string;
  viewed_at: string;
  player_one: ComparisonViewPlayerRow | ComparisonViewPlayerRow[] | null;
  player_two: ComparisonViewPlayerRow | ComparisonViewPlayerRow[] | null;
}

function mapPlayerRef(
  value: ComparisonViewPlayerRow | ComparisonViewPlayerRow[] | null,
): ComparisonViewPlayerRow | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapComparisonViewRow(row: ComparisonViewQueryRow): ComparisonViewPair | null {
  const playerOne = mapPlayerRef(row.player_one);
  const playerTwo = mapPlayerRef(row.player_two);
  if (!playerOne || !playerTwo) {
    return null;
  }

  return {
    playerOneId: row.player_one_id,
    playerTwoId: row.player_two_id,
    playerOneSlug: playerOne.slug,
    playerTwoSlug: playerTwo.slug,
    playerOneName: playerOne.name,
    playerTwoName: playerTwo.name,
    viewCount: 1,
    lastViewedAt: row.viewed_at,
    href: comparePath(playerOne.slug, playerTwo.slug),
  };
}

export async function recordComparisonView(
  playerOneId: string,
  playerTwoId: string,
  options: { userId?: string | null; sessionId?: string | null },
): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  const [canonicalOne, canonicalTwo] = canonicalComparePlayerIds(
    playerOneId,
    playerTwoId,
  );

  try {
    const supabase = createSupabaseAdminClient();

    if (options.sessionId) {
      await supabase
        .from("comparison_views")
        .delete()
        .eq("session_id", options.sessionId)
        .eq("player_one_id", canonicalOne)
        .eq("player_two_id", canonicalTwo);
    }

    if (options.userId) {
      await supabase
        .from("comparison_views")
        .delete()
        .eq("user_id", options.userId)
        .eq("player_one_id", canonicalOne)
        .eq("player_two_id", canonicalTwo);
    }

    await supabase.from("comparison_views").insert({
      user_id: options.userId ?? null,
      session_id: options.sessionId ?? null,
      player_one_id: canonicalOne,
      player_two_id: canonicalTwo,
    });
  } catch {
    // Optional until migration is applied.
  }
}

export async function mergeComparisonViewsForUser(input: {
  sessionId: string;
  userId: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("comparison_views")
      .update({ user_id: input.userId, session_id: null })
      .eq("session_id", input.sessionId)
      .is("user_id", null);
  } catch {
    // Optional until migration is applied.
  }
}

async function aggregateComparisonViews(
  rows: ComparisonViewQueryRow[],
  limit: number,
  dedupeRecent = false,
): Promise<ComparisonViewPair[]> {
  if (dedupeRecent) {
    const seen = new Set<string>();
    const results: ComparisonViewPair[] = [];

    for (const row of rows) {
      const key = `${row.player_one_id}:${row.player_two_id}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const mapped = mapComparisonViewRow(row);
      if (mapped) {
        results.push(mapped);
      }

      if (results.length >= limit) {
        break;
      }
    }

    return results;
  }

  const counts = new Map<string, ComparisonViewPair>();

  for (const row of rows) {
    const key = `${row.player_one_id}:${row.player_two_id}`;
    const mapped = mapComparisonViewRow(row);
    if (!mapped) {
      continue;
    }

    const existing = counts.get(key);
    if (existing) {
      existing.viewCount += 1;
      if (row.viewed_at > existing.lastViewedAt) {
        existing.lastViewedAt = row.viewed_at;
      }
    } else {
      counts.set(key, { ...mapped });
    }
  }

  return [...counts.values()]
    .sort(
      (left, right) =>
        right.viewCount - left.viewCount ||
        right.lastViewedAt.localeCompare(left.lastViewedAt),
    )
    .slice(0, limit);
}

export async function listMostViewedComparisons(
  limit = 8,
  windowDays = 30,
): Promise<ComparisonViewPair[]> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return [];
  }

  const since = new Date(Date.now() - windowDays * 86_400_000).toISOString();

  try {
    const supabase = createSupabaseAdminClient();
    const result = await supabase
      .from("comparison_views")
      .select(
        `
        player_one_id,
        player_two_id,
        viewed_at,
        player_one:players!comparison_views_player_one_id_fkey ( slug, name ),
        player_two:players!comparison_views_player_two_id_fkey ( slug, name )
      `,
      )
      .gte("viewed_at", since)
      .order("viewed_at", { ascending: false })
      .limit(5000);

    if (result.error || !result.data?.length) {
      return [];
    }

    return aggregateComparisonViews(
      result.data as unknown as ComparisonViewQueryRow[],
      limit,
    );
  } catch {
    return [];
  }
}

export async function listRecentlyViewedComparisons(input: {
  userId?: string | null;
  sessionId?: string | null;
  limit?: number;
}): Promise<ComparisonViewPair[]> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return [];
  }

  const limit = Math.max(1, Math.min(input.limit ?? 6, 20));

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("comparison_views")
      .select(
        `
        player_one_id,
        player_two_id,
        viewed_at,
        player_one:players!comparison_views_player_one_id_fkey ( slug, name ),
        player_two:players!comparison_views_player_two_id_fkey ( slug, name )
      `,
      )
      .order("viewed_at", { ascending: false })
      .limit(limit * 3);

    if (input.userId) {
      query = query.eq("user_id", input.userId);
    } else if (input.sessionId) {
      query = query.eq("session_id", input.sessionId);
    } else {
      return [];
    }

    const result = await query;
    if (result.error || !result.data?.length) {
      return [];
    }

    return aggregateComparisonViews(
      result.data as unknown as ComparisonViewQueryRow[],
      limit,
      true,
    );
  } catch {
    return [];
  }
}

export function comparisonPairFromProfiles(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
): { playerOneId: string; playerTwoId: string } {
  const [playerOneId, playerTwoId] = canonicalComparePlayerIds(
    playerOne.player.id,
    playerTwo.player.id,
  );
  return { playerOneId, playerTwoId };
}
