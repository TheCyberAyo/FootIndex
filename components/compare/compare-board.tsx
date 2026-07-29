import { CompareChartsSection } from "@/components/charts/compare-charts-section";
import { CommentsSection } from "@/components/comments/comments-section";
import { CompareMetricsList } from "@/components/compare/compare-metrics-list";
import { CompareScoreboardCard } from "@/components/compare/compare-scoreboard";
import { CompareStickyHeader } from "@/components/compare/compare-sticky-header";
import { YearCompareLazy } from "@/components/compare/year-compare-lazy";
import { Container } from "@/components/shared/container";
import { Section } from "@/components/shared/section";
import { VoteSection } from "@/components/votes/vote-section";
import { buildComparison } from "@/lib/compare";
import type { PlayerProfile } from "@/types/domain";

interface CompareBoardProps {
  haaland: PlayerProfile;
  mbappe: PlayerProfile;
  initialSeason?: string | null;
  initialYear?: string | null;
}

/**
 * Full comparison experience — engine on the server, motion island for rows.
 */
export function CompareBoard({
  haaland,
  mbappe,
  initialSeason = null,
  initialYear = null,
}: CompareBoardProps) {
  const comparison = buildComparison(haaland, mbappe);

  return (
    <>
      <CompareStickyHeader
        haaland={haaland}
        mbappe={mbappe}
        haalandWins={comparison.scoreboard.haalandWins}
        mbappeWins={comparison.scoreboard.mbappeWins}
      />

      <Section
        eyebrow="Head to head"
        title="Career comparison"
        description="Leaders glow City blue. Bars scale to the higher value in each row."
      >
        <div className="mb-8">
          <CompareScoreboardCard
            scoreboard={comparison.scoreboard}
            haalandName={haaland.player.short_name}
            mbappeName={mbappe.player.short_name}
          />
        </div>
        <CompareMetricsList metrics={comparison.metrics} />
      </Section>

      <YearCompareLazy
        initialSeason={initialSeason}
        initialYear={initialYear}
      />

      <CompareChartsSection haaland={haaland} mbappe={mbappe} />
      <VoteSection nextPath="/compare#vote" />
      <CommentsSection
        entityType="compare"
        entityId="haaland-vs-mbappe"
        nextPath="/compare#comments"
        title="Head-to-head chat"
      />

      <Container className="pb-12">
        <p className="text-center text-xs text-white/35">
          Haaland left · Mbappé right · Mobile stacks values under each metric
        </p>
      </Container>
    </>
  );
}
