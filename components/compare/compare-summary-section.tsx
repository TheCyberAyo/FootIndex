import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import { assessComparePair } from "@/lib/compare/readiness";
import type { CompareResult } from "@/lib/compare/types";
import { hasCuratedCareer } from "@/lib/players/curated";
import { getComparisonSummary } from "@/services/compare/ai-summary.service";
import type { PlayerProfile } from "@/types/domain";

interface CompareSummarySectionProps {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
  comparison: CompareResult;
}

export async function CompareSummarySection({
  playerOne,
  playerTwo,
  comparison,
}: CompareSummarySectionProps) {
  const { text, source } = await getComparisonSummary(
    playerOne,
    playerTwo,
    comparison,
  );
  const readiness = assessComparePair(playerOne, playerTwo);
  const usesCurated =
    hasCuratedCareer(playerOne.player.slug) ||
    hasCuratedCareer(playerTwo.player.slug);

  const description =
    source === "ai"
      ? usesCurated
        ? "AI-generated from verified career baselines and synced stats."
        : "AI-generated from synced career stats — refreshes weekly when an API key is configured."
      : usesCurated
        ? "Auto-generated from verified career baselines — template fallback when AI is unavailable."
        : "Auto-generated from synced career stats — template fallback when AI is unavailable.";

  if (!readiness.pairReady) {
    return null;
  }

  return (
    <Section
      eyebrow="Summary"
      title="At a glance"
      description={description}
    >
      <GlassCard className="p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {text}
        </p>
      </GlassCard>
    </Section>
  );
}
