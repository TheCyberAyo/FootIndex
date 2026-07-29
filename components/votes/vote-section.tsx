import { VotePanel } from "@/components/votes/vote-panel";
import { Section } from "@/components/shared/section";
import { getVoteLeaderboard } from "@/services";
import type { VoteBundle } from "@/types/domain";

interface VoteSectionProps {
  nextPath?: string;
  description?: string;
}

/**
 * Server-hydrated voting section for home + compare (#vote).
 * Decision: only public tallies on the server so pages stay ISR-friendly;
 * auth + user vote hydrate via /api/votes on the client.
 */
export async function VoteSection({
  nextPath = "/compare#vote",
  description = "Sign in with email or Google. One vote per account — change it anytime.",
}: VoteSectionProps) {
  const tallies = await getVoteLeaderboard();
  const initialBundle: VoteBundle = {
    tallies,
    totalVotes: tallies.reduce((sum, item) => sum + item.voteCount, 0),
    userVote: null,
    isAuthenticated: false,
    userEmail: null,
  };

  return (
    <Section
      id="vote"
      eyebrow="Community"
      title="Who is better?"
      description={description}
    >
      <VotePanel initialBundle={initialBundle} nextPath={nextPath} />
    </Section>
  );
}
