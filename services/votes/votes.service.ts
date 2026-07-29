import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoError, ServiceError } from "@/services/errors";
import type { VoteChoice, VoteLeaderboardRow } from "@/types/database";
import type { VoteTally } from "@/types/domain";

const EMPTY_TALLY: VoteTally[] = [
  { choice: "haaland", voteCount: 0, votePercentage: 0 },
  { choice: "mbappe", voteCount: 0, votePercentage: 0 },
];

/**
 * Votes persistence against Supabase.
 * Leaderboard is public; writes require an authenticated server client.
 */
export async function getVoteLeaderboard(): Promise<VoteTally[]> {
  if (!isSupabaseConfigured()) {
    return EMPTY_TALLY;
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase.from("vote_leaderboard").select("*");

  assertNoError(result.error, "Failed to load vote leaderboard");

  const data = (result.data ?? []) as VoteLeaderboardRow[];

  if (data.length === 0) {
    return EMPTY_TALLY;
  }

  const byChoice = new Map<VoteChoice, VoteTally>();
  EMPTY_TALLY.forEach((item) => byChoice.set(item.choice, item));

  data.forEach((row) => {
    byChoice.set(row.choice, {
      choice: row.choice,
      voteCount: row.vote_count,
      votePercentage: Number(row.vote_percentage ?? 0),
    });
  });

  return Array.from(byChoice.values());
}

export async function getUserVote(
  userId: string,
): Promise<VoteChoice | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from("votes")
    .select("choice")
    .eq("user_id", userId)
    .maybeSingle();

  assertNoError(result.error, "Failed to load user vote");

  const row = result.data as { choice: VoteChoice } | null;
  return row?.choice ?? null;
}

export async function upsertUserVote(
  userId: string,
  choice: VoteChoice,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new ServiceError(
      "Voting requires Supabase configuration.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase.from("votes").upsert(
    {
      user_id: userId,
      choice,
    },
    { onConflict: "user_id" },
  );

  assertNoError(result.error, "Failed to save vote");
}
