import { PlayersCatalog } from "@/components/players/players-catalog";
import { PlayerSearch } from "@/components/search/player-search";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo/json-ld";
import { listPlayersCatalog } from "@/services/players/players-catalog.service";

export const metadata = createPageMetadata({
  title: "Football Players",
  description:
    "Browse every football player in the FootIndex database — A–Z catalog with career stats, comparisons, and profiles.",
  path: "/players",
  keywords: ["football players", "player catalog", "soccer players database"],
});

export const revalidate = 60;

interface PlayersPageProps {
  searchParams: Promise<{ page?: string; letter?: string }>;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const { page: pageRaw, letter } = await searchParams;
  const page = pageRaw ? Number(pageRaw) : 1;
  const catalog = await listPlayersCatalog({
    page: Number.isFinite(page) ? page : 1,
    letter: letter ?? null,
  });

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Players", path: "/players" },
  ];

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "Football Players",
            description:
              "Browse the full FootIndex player catalog alphabetically.",
            path: "/players",
          }),
          createBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />

      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        eyebrow="Player catalog"
        title="All football players"
        description="Browse the full database alphabetically or use search to jump to a profile."
      />

      <Section
        title="Quick search"
        description="Find a specific player instantly — filters available on the search page."
      >
        <PlayerSearch variant="page" />
      </Section>

      <Section
        title="Browse A–Z"
        description="Paginated catalog of every player profile in FootIndex."
      >
        <PlayersCatalog catalog={catalog} />
      </Section>
    </>
  );
}
