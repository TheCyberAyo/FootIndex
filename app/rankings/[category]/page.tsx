import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { RankingTable } from "@/components/rankings/ranking-table";
import { RankingsCategoryGrid } from "@/components/rankings/rankings-category-grid";
import { RankingsFilterPanel } from "@/components/rankings/rankings-filter-panel";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import {
  getRankingCategory,
  RANKING_CATEGORIES,
  rankingPath,
} from "@/lib/rankings/categories";
import { parseRankingFilters } from "@/lib/rankings/filters";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo/json-ld";
import { getRanking } from "@/services/rankings/rankings.service";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return RANKING_CATEGORIES.map((category) => ({ category: category.slug }));
}

interface RankingsCategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    position?: string;
    nationality?: string;
    competition?: string;
    season?: string;
    ageMin?: string;
    ageMax?: string;
  }>;
}

export async function generateMetadata({ params }: RankingsCategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getRankingCategory(categorySlug);

  if (!category) {
    return createPageMetadata({
      title: "Ranking not found",
      description: "This ranking category does not exist.",
      path: `/rankings/${categorySlug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: category.title,
    description: category.description,
    path: rankingPath(categorySlug),
    keywords: [category.title, "football rankings", category.slug],
  });
}

export default async function RankingsCategoryPage({
  params,
  searchParams,
}: RankingsCategoryPageProps) {
  const [{ category: categorySlug }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const filters = parseRankingFilters(query);
  const result = await getRanking(categorySlug, filters);

  if (!result) {
    notFound();
  }

  const { category, entries } = result;
  const path = rankingPath(categorySlug);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Rankings", path: "/rankings" },
    { name: category.title, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: category.title,
            description: category.description,
            path,
          }),
          createBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        eyebrow="Rankings"
        title={category.title}
        description={category.description}
      />

      <Section title="Leaderboard">
        <RankingsFilterPanel initialFilters={filters} />
        <RankingTable
          entries={entries}
          metricLabel={category.metricLabel}
          emptyMessage={`No players qualify for ${category.title} yet.`}
        />
      </Section>

      <Section title="Other rankings">
        <RankingsCategoryGrid />
      </Section>
    </>
  );
}
