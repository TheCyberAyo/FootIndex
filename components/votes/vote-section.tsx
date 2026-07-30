import { CompareVoteSection } from "@/components/votes/compare-vote-section";
import { FEATURED_RIVALRY } from "@/lib/brand/featured-rivalry";

interface VoteSectionProps {
  nextPath?: string;
  description?: string;
}

/**
 * Featured rivalry voting — delegates to generalized compare votes.
 */
export async function VoteSection({
  nextPath = "/compare#vote",
  description = "Sign in with email or Google. One vote per account — change it anytime.",
}: VoteSectionProps) {
  return (
    <CompareVoteSection
      playerOneSlug={FEATURED_RIVALRY.playerOneSlug}
      playerTwoSlug={FEATURED_RIVALRY.playerTwoSlug}
      nextPath={nextPath}
      description={description}
    />
  );
}
