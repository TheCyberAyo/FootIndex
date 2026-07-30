import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import { buildComparisonSummary } from "@/lib/compare/summary";
import type { CompareResult } from "@/lib/compare/types";
import type { PlayerProfile } from "@/types/domain";

interface CompareSummarySectionProps {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
  comparison: CompareResult;
}

/**
 * Template-based comparison summary (non-AI v1).
 */
export function CompareSummarySection({
  playerOne,
  playerTwo,
  comparison,
}: CompareSummarySectionProps) {
  const summary = buildComparisonSummary(playerOne, playerTwo, comparison);

  return (
    <Section
      eyebrow="Summary"
      title="At a glance"
      description="Auto-generated from synced career stats — not an AI opinion piece."
    >
      <GlassCard className="p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-white/75 sm:text-base">
          {summary}
        </p>
      </GlassCard>
    </Section>
  );
}
