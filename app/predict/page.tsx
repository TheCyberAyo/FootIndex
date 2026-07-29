import { CommentsSection } from "@/components/comments/comments-section";
import { PredictionsSection } from "@/components/predictions/predictions-section";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { createPageMetadata } from "@/lib/seo";
import {
  createBreadcrumbJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/json-ld";

export const metadata = createPageMetadata({
  title: "Predict",
  description:
    "Predict upcoming Haaland and Mbappé match scorelines and first scorers.",
  path: "/predict",
});

export const revalidate = 60;

export default function PredictPage() {
  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "Match predictions",
            description:
              "Predict upcoming Haaland and Mbappé match scorelines and first scorers.",
            path: "/predict",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Predict", path: "/predict" },
          ]),
        ]}
      />
      <PageHeader
        eyebrow="Engagement"
        title="Match predictions"
        description="Tip the score and first scorer for upcoming fixtures involving City and Madrid."
      />
      <PredictionsSection nextPath="/predict#predict" />
      <CommentsSection
        entityType="prediction"
        entityId="upcoming-board"
        nextPath="/predict#comments"
        title="Prediction chat"
        description="Talk tips before kickoff."
      />
    </>
  );
}
