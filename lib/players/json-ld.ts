import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { formatPosition, getPlayerAge } from "@/lib/players/format";
import type { PlayerProfile } from "@/types/domain";

/**
 * Athlete JSON-LD for player pages (SEO-ready in Phase 4).
 */
export function createAthleteJsonLd(profile: PlayerProfile, path: string) {
  const { player, career } = profile;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}${path}#athlete`,
    name: player.name,
    alternateName: player.short_name,
    nationality: player.nationality,
    birthDate: player.date_of_birth,
    height: `${player.height_cm} cm`,
    image: player.image_url ?? undefined,
    jobTitle: formatPosition(player.position),
    description: player.bio || `${player.name} player profile on ${SITE_NAME}.`,
    url: `${SITE_URL}${path}`,
    memberOf: player.current_team
      ? {
          "@type": "SportsTeam",
          name: player.current_team.name,
          logo: player.current_team.logo_url ?? undefined,
        }
      : undefined,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "age",
        value: getPlayerAge(player.date_of_birth),
      },
      {
        "@type": "PropertyValue",
        name: "careerGoals",
        value: career?.goals ?? 0,
      },
      {
        "@type": "PropertyValue",
        name: "careerAssists",
        value: career?.assists ?? 0,
      },
    ],
  };
}
