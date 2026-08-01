import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { AdPlacement } from "@/components/ads/ad-placement";
import { JsonLd } from "@/components/seo/json-ld";
import { RankingsCategoryGrid } from "@/components/rankings/rankings-category-grid";
import { RankingTable } from "@/components/rankings/ranking-table";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo/json-ld";
import { getTopScorersPreview } from "@/services/rankings/rankings.service";

export const metadata = createPageMetadata({
  title: "Football Rankings",
  description:
    "Top scorers, assists, goal contributions, international and Champions League rankings from our player database.",
  path: "/rankings",
  keywords: [
    "football rankings",
    "top scorers",
    "top assists",
    "Champions League top scorers",
  ],
});

export const revalidate = 60;

export default async function RankingsPage() {
  const preview = await getTopScorersPreview(5);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Rankings", path: "/rankings" },
  ];

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "Football Rankings",
            description: "Career and competition rankings across FootIndex players.",
            path: "/rankings",
          }),
          createBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        eyebrow="Rankings"
        title="Football Rankings"
        description="Career leaderboards powered by synced player stats. More players means richer rankings."
      />

      <Section
        title="Top scorers preview"
        description="Current career goals leaders in our database."
      >
        <RankingTable entries={preview} metricLabel="Goals" />
      </Section>

      <Section containerClassName="py-6 sm:py-8">
        <AdPlacement slotKey="rankings" format="horizontal" minHeight={90} />
      </Section>

      <Section
        title="All categories"
        description="Browse every ranking category from the product spec."
      >
        <RankingsCategoryGrid />
      </Section>
    </>
  );
}
