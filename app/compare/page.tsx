import { CompareBoard } from "@/components/compare/compare-board";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/seo";
import {
  createBreadcrumbJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/json-ld";
import { getComparisonProfiles } from "@/services";

export const metadata = createPageMetadata({
  title: "Career Comparison",
  description:
    "Haaland vs Mbappé stats: career goals, club vs country, Champions League, trophies, and search any season or year for a head-to-head comparison.",
  path: "/compare",
  keywords: [
    "Haaland vs Mbappé stats",
    "Haaland vs Mbappé career goals",
    "Haaland vs Mbappé trophies",
    "Haaland vs Mbappé by season",
  ],
});

/** Career rollups change on sync — keep fresh without full SSR every request. */
export const revalidate = 60;

interface ComparePageProps {
  searchParams: Promise<{
    season?: string;
    year?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const [{ haaland, mbappe }, params] = await Promise.all([
    getComparisonProfiles(),
    searchParams,
  ]);

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "Haaland vs Mbappé Career Comparison",
            description:
              "Haaland vs Mbappé stats: career goals, club vs country, Champions League, trophies, and season-by-year head-to-head.",
            path: "/compare",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Career Comparison", path: "/compare" },
          ]),
        ]}
      />
      <CompareBoard
        haaland={haaland}
        mbappe={mbappe}
        initialSeason={params.season ?? null}
        initialYear={params.year ?? null}
      />
    </>
  );
}
