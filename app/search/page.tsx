import { PlayerSearch } from "@/components/search/player-search";
import { Section } from "@/components/shared/section";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { parseSearchFilters } from "@/lib/search/filters";
import { MIN_QUERY_LENGTH, listMostSearchedPlayers } from "@/services";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    position?: string;
    nationality?: string;
    club?: string;
    competition?: string;
    ageMin?: string;
    ageMax?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  if (query.length >= MIN_QUERY_LENGTH) {
    return createPageMetadata({
      title: `Search: ${query}`,
      description: `Football player search results for “${query}”. Career stats, goals, assists, and trophies.`,
      path: `/search?q=${encodeURIComponent(query)}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: "Search Players",
    description:
      "Search any football player for career statistics, goals, assists, trophies, and comparisons.",
    path: "/search",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const initialFilters = parseSearchFilters(params);
  const popularSearches = await listMostSearchedPlayers(8);

  return (
    <>
      <JsonLd
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Search", path: "/search" },
        ])}
      />

      <Section
        eyebrow="Player search"
        title="Find any football player"
        description="Instant autocomplete from the database — filter by position, nationality, or club."
      >
        <PlayerSearch
          variant="page"
          initialQuery={query}
          initialFilters={initialFilters}
          popularSearches={popularSearches}
          autoFocus
        />
      </Section>
    </>
  );
}
