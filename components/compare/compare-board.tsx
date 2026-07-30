import { CompareChartsSection } from "@/components/charts/compare-charts-section";
import { CommentsSection } from "@/components/comments/comments-section";
import { CompareMetricsList } from "@/components/compare/compare-metrics-list";
import { CompareScoreboardCard } from "@/components/compare/compare-scoreboard";
import { ComparePlayerPickerLazy } from "@/components/compare/compare-player-picker-lazy";
import { CompareStickyHeader } from "@/components/compare/compare-sticky-header";
import { CompareSummarySection } from "@/components/compare/compare-summary-section";
import { YearCompareLazy } from "@/components/compare/year-compare-lazy";
import { Container } from "@/components/shared/container";
import { Section } from "@/components/shared/section";
import { CompareVoteSection } from "@/components/votes/compare-vote-section";
import { buildComparison } from "@/lib/compare";
import type { CompareResult } from "@/lib/compare/types";
import type { PlayerProfile } from "@/types/domain";

interface CompareBoardProps {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
  comparePath: string;
  entityId: string;
  comparison?: CompareResult;
  initialSeason?: string | null;
  initialYear?: string | null;
}

/**
 * Full comparison experience — engine on the server, motion island for rows.
 */
export function CompareBoard({
  playerOne,
  playerTwo,
  comparePath,
  entityId,
  comparison: comparisonProp,
  initialSeason = null,
  initialYear = null,
}: CompareBoardProps) {
  const comparison = comparisonProp ?? buildComparison(playerOne, playerTwo);
  const playerOneName = playerOne.player.short_name;
  const playerTwoName = playerTwo.player.short_name;

  return (
    <>
      <CompareStickyHeader
        playerOne={playerOne}
        playerTwo={playerTwo}
        playerOneWins={comparison.scoreboard.playerOneWins}
        playerTwoWins={comparison.scoreboard.playerTwoWins}
      />

      <ComparePlayerPickerLazy
        playerOneSlug={playerOne.player.slug}
        playerOneName={playerOneName}
        playerOneImageUrl={playerOne.player.image_url}
        playerTwoSlug={playerTwo.player.slug}
        playerTwoName={playerTwoName}
        playerTwoImageUrl={playerTwo.player.image_url}
      />

      <Section
        eyebrow="Head to head"
        title={`${playerOneName} vs ${playerTwoName}`}
        description="Leaders highlighted in brand blue. Same table layout on every screen size."
      >
        <div className="mb-8">
          <CompareScoreboardCard
            scoreboard={comparison.scoreboard}
            playerOneName={playerOneName}
            playerTwoName={playerTwoName}
          />
        </div>
        <CompareMetricsList
          metrics={comparison.metrics}
          playerOneName={playerOneName}
          playerTwoName={playerTwoName}
        />
      </Section>

      <CompareSummarySection
        playerOne={playerOne}
        playerTwo={playerTwo}
        comparison={comparison}
      />

      <YearCompareLazy
        playerOne={playerOne}
        playerTwo={playerTwo}
        comparePath={comparePath}
        initialSeason={initialSeason}
        initialYear={initialYear}
      />

      <CompareChartsSection playerOne={playerOne} playerTwo={playerTwo} />

      <CompareVoteSection
        playerOneSlug={playerOne.player.slug}
        playerTwoSlug={playerTwo.player.slug}
        nextPath={`${comparePath}#vote`}
      />

      <CommentsSection
        entityType="compare"
        entityId={entityId}
        nextPath={`${comparePath}#comments`}
        title="Head-to-head chat"
      />

      <Container className="pb-12">
        <p className="text-center text-xs text-muted-foreground">
          {playerOneName} · {playerTwoName} · Scroll the table horizontally on
          very small screens if needed
        </p>
      </Container>
    </>
  );
}
