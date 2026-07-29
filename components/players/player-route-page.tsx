import { PlayerProfileView } from "@/components/players/player-profile-view";
import { JsonLd } from "@/components/seo/json-ld";
import { createAthleteJsonLd } from "@/lib/players/json-ld";
import {
  createPlayerMetadata,
  loadPlayerProfile,
  playerPathForSlug,
  type PlayerSlug,
} from "@/lib/players/load-profile";
import { createBreadcrumbJsonLd } from "@/lib/seo/json-ld";

interface PlayerRoutePageProps {
  slug: PlayerSlug;
}

export async function generatePlayerRouteMetadata(slug: PlayerSlug) {
  return createPlayerMetadata(slug);
}

/**
 * Shared route body for /haaland, /mbappe, and /players/[slug].
 */
export async function PlayerRoutePage({ slug }: PlayerRoutePageProps) {
  const rivalSlug: PlayerSlug = slug === "haaland" ? "mbappe" : "haaland";
  const [profile, rival] = await Promise.all([
    loadPlayerProfile(slug),
    loadPlayerProfile(rivalSlug),
  ]);
  const path = playerPathForSlug(slug);

  return (
    <>
      <JsonLd
        data={[
          createAthleteJsonLd(profile, path),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: profile.player.short_name, path },
          ]),
        ]}
      />
      <PlayerProfileView profile={profile} rival={rival} />
    </>
  );
}
