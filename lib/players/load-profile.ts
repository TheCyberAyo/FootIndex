import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { PLAYERS } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { getPlayerProfileBySlug } from "@/services";
import type { PlayerProfile } from "@/types/domain";

export const PLAYER_SLUGS = ["haaland", "mbappe"] as const;
export type PlayerSlug = (typeof PLAYER_SLUGS)[number];

export function isPlayerSlug(value: string): value is PlayerSlug {
  return PLAYER_SLUGS.includes(value as PlayerSlug);
}

export function playerPathForSlug(slug: PlayerSlug): string {
  return PLAYERS[slug].path;
}

export async function loadPlayerProfile(
  slug: string,
): Promise<PlayerProfile> {
  if (!isPlayerSlug(slug)) {
    notFound();
  }

  const profile = await getPlayerProfileBySlug(slug);
  if (!profile) {
    notFound();
  }

  return profile;
}

export async function createPlayerMetadata(
  slug: string,
): Promise<Metadata> {
  if (!isPlayerSlug(slug)) {
    return createPageMetadata({
      title: "Player not found",
      description: "This player profile does not exist.",
      path: `/players/${slug}`,
      noIndex: true,
    });
  }

  const profile = await getPlayerProfileBySlug(slug);
  const path = playerPathForSlug(slug);
  const name = profile?.player.name ?? PLAYERS[slug].name;
  const club = profile?.player.current_team?.name;
  const goals = profile?.career?.goals;

  const rival =
    slug === "haaland" ? "Kylian Mbappé" : "Erling Haaland";
  const description = [
    `${name} career stats`,
    club ? `${club}` : null,
    goals != null ? `${goals} career goals` : null,
    `club and country record, trophies, and awards — compare with ${rival} on Haaland vs Mbappé.`,
  ]
    .filter(Boolean)
    .join(" — ");

  return createPageMetadata({
    title: `${name} Career Stats`,
    description,
    path,
    imageUrl: profile?.player.image_url,
    ogType: "profile",
    keywords: [
      name,
      `${PLAYERS[slug].shortName} career goals`,
      `${PLAYERS[slug].shortName} trophies`,
      "Haaland vs Mbappé",
    ],
  });
}
