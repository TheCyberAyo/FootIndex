import { PlayerProfileView } from "@/components/players/player-profile-view";
import { RelatedPlayers } from "@/components/players/related-players";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { createAthleteJsonLd } from "@/lib/players/json-ld";
import {
  createPlayerMetadata,
  loadPlayerProfile,
} from "@/lib/players/load-profile";
import { playerPath } from "@/lib/players/paths";
import { loadComparisonRival } from "@/lib/players/rival";
import { createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo/json-ld";

interface PlayerRoutePageProps {
  slug: string;
}

export async function generatePlayerRouteMetadata(slug: string) {
  return createPlayerMetadata(slug);
}

/**
 * Shared route body for /player/[slug].
 */
export async function PlayerRoutePage({ slug }: PlayerRoutePageProps) {
  const [profile, rival] = await Promise.all([
    loadPlayerProfile(slug),
    loadComparisonRival(slug),
  ]);
  const path = playerPath(slug);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Players", path: "/search" },
    { name: profile.player.short_name, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: `${profile.player.name} Career Stats`,
            description:
              profile.player.bio ||
              `Explore ${profile.player.name} career statistics, goals, assists, trophies, and season records.`,
            path,
          }),
          createAthleteJsonLd(profile, path),
          createBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <PlayerProfileView profile={profile} rival={rival} />
      <RelatedPlayers currentSlug={slug} />
    </>
  );
}
