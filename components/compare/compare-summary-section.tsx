import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import type { CompareResult } from "@/lib/compare/types";
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

  return (
    <Section
      eyebrow="Summary"
      title="At a glance"
      description={
        source === "ai"
          ? "AI-generated from synced career stats — refreshes weekly when an API key is configured."
          : "Auto-generated from synced career stats — template fallback when AI is unavailable."
      }
    >
      <GlassCard className="p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {text}
        </p>
      </GlassCard>
    </Section>
  );
}
