import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { isValidPlayerSlugFormat, playerPath } from "@/lib/players/paths";
import { createPageMetadata } from "@/lib/seo";
import { getPlayerProfileBySlug } from "@/services";
import type { PlayerProfile } from "@/types/domain";

export async function loadPlayerProfile(slug: string): Promise<PlayerProfile> {
  if (!isValidPlayerSlugFormat(slug)) {
    notFound();
  }

  const profile = await getPlayerProfileBySlug(slug);
  if (!profile) {
    notFound();
  }

  return profile;
}

export async function createPlayerMetadata(slug: string): Promise<Metadata> {
  const path = playerPath(slug);

  if (!isValidPlayerSlugFormat(slug)) {
    return createPageMetadata({
      title: "Player not found",
      description: "This player profile does not exist.",
      path,
      noIndex: true,
    });
  }

  const profile = await getPlayerProfileBySlug(slug);
  if (!profile) {
    return createPageMetadata({
      title: "Player not found",
      description: "This player profile does not exist.",
      path,
      noIndex: true,
    });
  }

  const { player, career } = profile;
  const club = player.current_team?.name;
  const goals = career?.goals;
  const assists = career?.assists;

  const description = [
    `${player.name} career stats`,
    club ?? null,
    goals != null ? `${goals} career goals` : null,
    assists != null ? `${assists} assists` : null,
    "club and country record, trophies, and awards.",
  ]
    .filter(Boolean)
    .join(" — ");

  return createPageMetadata({
    title: `${player.name} Career Stats`,
    description,
    path,
    imageUrl: player.image_url,
    ogType: "profile",
    keywords: [
      player.name,
      `${player.short_name} career goals`,
      `${player.short_name} stats`,
      `${player.short_name} trophies`,
      player.nationality,
      club ?? "",
    ].filter(Boolean),
  });
}
