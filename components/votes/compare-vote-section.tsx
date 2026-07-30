import { CompareVotePanel } from "@/components/votes/compare-vote-panel";
import { Section } from "@/components/shared/section";
import { getAuthUser } from "@/lib/auth/session";
import { getCompareVoteBundle } from "@/services/votes/comparison-votes.service";
import { getPlayerProfileBySlug } from "@/services/players/players.service";

interface CompareVoteSectionProps {
  playerOneSlug: string;
  playerTwoSlug: string;
  nextPath?: string;
  description?: string;
}

/**
 * Server-hydrated voting for any compare pair.
 */
export async function CompareVoteSection({
  playerOneSlug,
  playerTwoSlug,
  nextPath = "/compare#vote",
  description = "Sign in with email or Google. One vote per account per matchup — change it anytime.",
}: CompareVoteSectionProps) {
  const [playerOne, playerTwo, user] = await Promise.all([
    getPlayerProfileBySlug(playerOneSlug),
    getPlayerProfileBySlug(playerTwoSlug),
    getAuthUser(),
  ]);

  if (!playerOne || !playerTwo) {
    return null;
  }

  const initialBundle = await getCompareVoteBundle({
    playerOneId: playerOne.player.id,
    playerOneSlug: playerOne.player.slug,
    playerTwoId: playerTwo.player.id,
    playerTwoSlug: playerTwo.player.slug,
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
  });

  return (
    <Section
      id="vote"
      eyebrow="Community"
      title="Who is better?"
      description={description}
    >
      <CompareVotePanel
        playerOneSlug={playerOne.player.slug}
        playerTwoSlug={playerTwo.player.slug}
        playerOneName={playerOne.player.short_name}
        playerTwoName={playerTwo.player.short_name}
        initialBundle={initialBundle}
        nextPath={nextPath}
      />
    </Section>
  );
}
