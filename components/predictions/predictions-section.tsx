import { PredictionsPanel } from "@/components/predictions/predictions-panel";
import { Section } from "@/components/shared/section";
import { listPublicPredictionSummaries } from "@/services/predictions/predictions.service";

interface PredictionsSectionProps {
  nextPath?: string;
  compact?: boolean;
}

export async function PredictionsSection({
  nextPath = "/predict",
  compact = false,
}: PredictionsSectionProps) {
  const summaries = await listPublicPredictionSummaries();
  const limited = compact ? summaries.slice(0, 2) : summaries;

  return (
    <Section
      id="predict"
      eyebrow="Predictions"
      title="Call the score"
      description="Sign in to tip scorelines and first scorers. One prediction per match — update anytime before kickoff."
    >
      <PredictionsPanel initialSummaries={limited} nextPath={nextPath} />
    </Section>
  );
}
