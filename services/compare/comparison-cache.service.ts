import { buildComparison } from "@/lib/compare/engine";
import type { CompareResult } from "@/lib/compare/types";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import type { PlayerProfile } from "@/types/domain";
import type { Json } from "@/types/database";

function canonicalPlayerIds(idA: string, idB: string): [string, string] {
  return idA < idB ? [idA, idB] : [idB, idA];
}

export async function getCachedComparison(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
  seasonFilter = "",
): Promise<CompareResult> {
  const comparison = buildComparison(playerOne, playerTwo);

  if (!isSupabaseConfigured()) {
    return comparison;
  }

  try {
    const [playerOneId, playerTwoId] = canonicalPlayerIds(
      playerOne.player.id,
      playerTwo.player.id,
    );

    const supabase = createSupabasePublicClient();
    const cached = await supabase
      .from("comparison_cache")
      .select("comparison_json, updated_at")
      .eq("player_one_id", playerOneId)
      .eq("player_two_id", playerTwoId)
      .eq("season_filter", seasonFilter)
      .maybeSingle();

    if (!cached.error && cached.data) {
      const playerUpdatedAt = Math.max(
        new Date(playerOne.player.updated_at ?? 0).getTime(),
        new Date(playerTwo.player.updated_at ?? 0).getTime(),
      );
      const cacheUpdatedAt = new Date(cached.data.updated_at).getTime();

      if (cacheUpdatedAt >= playerUpdatedAt) {
        return cached.data.comparison_json as unknown as CompareResult;
      }
    }

    const admin = createSupabaseAdminClient();
    await admin.from("comparison_cache").upsert(
      {
        player_one_id: playerOneId,
        player_two_id: playerTwoId,
        season_filter: seasonFilter,
        comparison_json: comparison as unknown as Json,
      },
      { onConflict: "player_one_id,player_two_id,season_filter" },
    );
  } catch {
    // Cache table optional until migration is applied.
  }

  return comparison;
}

export async function invalidateComparisonCacheForPlayer(
  playerId: string,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const deleted = await supabase
    .from("comparison_cache")
    .delete()
    .or(`player_one_id.eq.${playerId},player_two_id.eq.${playerId}`);

  assertNoError(deleted.error, "Failed to invalidate comparison cache");
}
