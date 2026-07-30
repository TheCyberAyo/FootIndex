import { PlayerSearch } from "@/components/search/player-search";
import { PlayerSearchResultsList } from "@/components/search/player-search-result";
import { EmptyState } from "@/components/shared/empty-state";
import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { MIN_QUERY_LENGTH, searchPlayers } from "@/services";

export const revalidate = 60;

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

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
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results =
    query.length >= MIN_QUERY_LENGTH ? await searchPlayers(query, 25) : [];

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
        description="Instant autocomplete from the database — no external API calls during search."
      >
        <PlayerSearch variant="page" initialQuery={query} autoFocus />
      </Section>

      {query.length >= MIN_QUERY_LENGTH ? (
        <Section
          title={`Results for “${query}”`}
          description={
            results.length === 1
              ? "1 player found"
              : `${results.length} players found`
          }
        >
          {results.length === 0 ? (
            <EmptyState
              title="No players found"
              description={`No players found for “${query}”. Try a different name, club, or nationality.`}
            />
          ) : (
            <GlassCard className="overflow-hidden p-2">
              <PlayerSearchResultsList results={results} />
            </GlassCard>
          )}
        </Section>
      ) : null}
    </>
  );
}
