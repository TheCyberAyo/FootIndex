import { getAuthUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { ServiceError } from "@/services/errors";
import { ensureUserProfile } from "@/services/users/ensure-profile";
import {
  getUserVote,
  getVoteLeaderboard,
  upsertUserVote,
} from "@/services/votes/votes.service";
import type { VoteChoice } from "@/types/database";
import type { VoteBundle, VoteTally } from "@/types/domain";

export { ensureUserProfile } from "@/services/users/ensure-profile";

function totalFromTallies(tallies: VoteTally[]): number {
  return tallies.reduce((sum, item) => sum + item.voteCount, 0);
}

export async function getVoteBundle(): Promise<VoteBundle> {
  const tallies = await getVoteLeaderboard();
  const user = await getAuthUser();

  if (!user) {
    return {
      tallies,
      totalVotes: totalFromTallies(tallies),
      userVote: null,
      isAuthenticated: false,
      userEmail: null,
    };
  }

  const userVote = await getUserVote(user.id);

  return {
    tallies,
    totalVotes: totalFromTallies(tallies),
    userVote,
    isAuthenticated: true,
    userEmail: user.email ?? null,
  };
}

export async function castVote(choice: VoteChoice): Promise<VoteBundle> {
  if (!isSupabaseConfigured()) {
    throw new ServiceError(
      "Voting requires Supabase configuration.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  if (choice !== "haaland" && choice !== "mbappe") {
    throw new ServiceError("Invalid vote choice.", "INVALID_VOTE_CHOICE");
  }

  const user = await getAuthUser();
  if (!user) {
    throw new ServiceError("Sign in to cast your vote.", "AUTH_REQUIRED");
  }

  await ensureUserProfile(user.id, user.email ?? null);
  await upsertUserVote(user.id, choice);

  return getVoteBundle();
}
