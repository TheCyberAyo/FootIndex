import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoError, ServiceError } from "@/services/errors";

export interface CompareVoteTally {
  playerId: string;
  slug: string;
  voteCount: number;
  votePercentage: number;
}

export interface CompareVoteBundle {
  playerOne: CompareVoteTally;
  playerTwo: CompareVoteTally;
  totalVotes: number;
  userChoicePlayerId: string | null;
  isAuthenticated: boolean;
  userEmail: string | null;
}

export function canonicalComparePlayerIds(
  playerOneId: string,
  playerTwoId: string,
): [string, string] {
  return playerOneId < playerTwoId
    ? [playerOneId, playerTwoId]
    : [playerTwoId, playerOneId];
}

function emptyTally(playerId: string, slug: string): CompareVoteTally {
  return { playerId, slug, voteCount: 0, votePercentage: 0 };
}

export async function getCompareVoteBundle(input: {
  playerOneId: string;
  playerOneSlug: string;
  playerTwoId: string;
  playerTwoSlug: string;
  userId?: string | null;
  userEmail?: string | null;
}): Promise<CompareVoteBundle> {
  const [canonicalOne, canonicalTwo] = canonicalComparePlayerIds(
    input.playerOneId,
    input.playerTwoId,
  );

  const tallyOne = emptyTally(input.playerOneId, input.playerOneSlug);
  const tallyTwo = emptyTally(input.playerTwoId, input.playerTwoSlug);

  if (!isSupabaseConfigured()) {
    return {
      playerOne: tallyOne,
      playerTwo: tallyTwo,
      totalVotes: 0,
      userChoicePlayerId: null,
      isAuthenticated: Boolean(input.userId),
      userEmail: input.userEmail ?? null,
    };
  }

  const supabase = createSupabasePublicClient();
  const votes = await supabase
    .from("comparison_votes")
    .select("choice_player_id")
    .eq("player_one_id", canonicalOne)
    .eq("player_two_id", canonicalTwo);

  if (votes.error) {
    return {
      playerOne: tallyOne,
      playerTwo: tallyTwo,
      totalVotes: 0,
      userChoicePlayerId: null,
      isAuthenticated: Boolean(input.userId),
      userEmail: input.userEmail ?? null,
    };
  }

  let countOne = 0;
  let countTwo = 0;
  for (const row of votes.data ?? []) {
    if (row.choice_player_id === input.playerOneId) {
      countOne += 1;
    } else if (row.choice_player_id === input.playerTwoId) {
      countTwo += 1;
    }
  }

  const totalVotes = countOne + countTwo;
  tallyOne.voteCount = countOne;
  tallyTwo.voteCount = countTwo;
  tallyOne.votePercentage = totalVotes ? (countOne / totalVotes) * 100 : 0;
  tallyTwo.votePercentage = totalVotes ? (countTwo / totalVotes) * 100 : 0;

  let userChoicePlayerId: string | null = null;
  if (input.userId) {
    const userVote = await supabase
      .from("comparison_votes")
      .select("choice_player_id")
      .eq("user_id", input.userId)
      .eq("player_one_id", canonicalOne)
      .eq("player_two_id", canonicalTwo)
      .maybeSingle();

    if (!userVote.error && userVote.data) {
      userChoicePlayerId = userVote.data.choice_player_id;
    }
  }

  return {
    playerOne: tallyOne,
    playerTwo: tallyTwo,
    totalVotes,
    userChoicePlayerId,
    isAuthenticated: Boolean(input.userId),
    userEmail: input.userEmail ?? null,
  };
}

export async function upsertCompareVote(input: {
  userId: string;
  playerOneId: string;
  playerTwoId: string;
  choicePlayerId: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new ServiceError(
      "Voting requires Supabase configuration.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  if (
    input.choicePlayerId !== input.playerOneId &&
    input.choicePlayerId !== input.playerTwoId
  ) {
    throw new ServiceError("Invalid vote choice.", "INVALID_VOTE_CHOICE");
  }

  const [playerOneId, playerTwoId] = canonicalComparePlayerIds(
    input.playerOneId,
    input.playerTwoId,
  );

  const supabase = await createSupabaseServerClient();
  const result = await supabase.from("comparison_votes").upsert(
    {
      user_id: input.userId,
      player_one_id: playerOneId,
      player_two_id: playerTwoId,
      choice_player_id: input.choicePlayerId,
    },
    { onConflict: "user_id,player_one_id,player_two_id" },
  );

  assertNoError(result.error, "Failed to save comparison vote");
}
