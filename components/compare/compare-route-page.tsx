import { CompareBoard } from "@/components/compare/compare-board";
import { AdPlacement } from "@/components/ads/ad-placement";
import { ComparisonViewTracker } from "@/components/compare/comparison-view-tracker";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  createCompareArticleJsonLd,
  createCompareComparisonJsonLd,
  createCompareFaqJsonLd,
} from "@/lib/compare/json-ld";
import {
  createCompareMetadata,
  loadCompareRouteData,
} from "@/lib/compare/load-compare";
import { createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo/json-ld";
import { getCachedComparison } from "@/services/compare/comparison-cache.service";

interface CompareRoutePageProps {
  playerOneSlug: string;
  playerTwoSlug: string;
  initialSeason?: string | null;
  initialYear?: string | null;
}

export async function generateCompareRouteMetadata(
  playerOneSlug: string,
  playerTwoSlug: string,
) {
  return createCompareMetadata(playerOneSlug, playerTwoSlug);
}

export async function CompareRoutePage({
  playerOneSlug,
  playerTwoSlug,
  initialSeason = null,
  initialYear = null,
}: CompareRoutePageProps) {
  const { playerOne, playerTwo, path, entityId } = await loadCompareRouteData(
    playerOneSlug,
    playerTwoSlug,
  );
  const comparison = await getCachedComparison(playerOne, playerTwo);

  const title = `${playerOne.player.short_name} vs ${playerTwo.player.short_name} Career Comparison`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: playerOne.player.short_name, path: `/player/${playerOne.player.slug}` },
    { name: playerTwo.player.short_name, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title,
            description: `${playerOne.player.name} vs ${playerTwo.player.name} career stats, goals, trophies, and head-to-head comparison.`,
            path,
          }),
          createCompareArticleJsonLd({ playerOne, playerTwo, path }),
          createCompareComparisonJsonLd({ playerOne, playerTwo, path }),
          createCompareFaqJsonLd(playerOne, playerTwo),
          createBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <ComparisonViewTracker
        playerOneId={playerOne.player.id}
        playerTwoId={playerTwo.player.id}
      />
      <CompareBoard
        playerOne={playerOne}
        playerTwo={playerTwo}
        comparePath={path}
        entityId={entityId}
        comparison={comparison}
        initialSeason={initialSeason}
        initialYear={initialYear}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AdPlacement slotKey="compare" format="horizontal" minHeight={90} />
      </div>
    </>
  );
}
