import { notFound } from "next/navigation";

import type { Metadata } from "next";

import {
  compareEntityId,
  comparePath,
  isValidCompareSlugPair,
} from "@/lib/compare/paths";
import { isValidPlayerSlugFormat } from "@/lib/players/paths";
import { createPageMetadata } from "@/lib/seo";
import { getPlayerProfileBySlug } from "@/services";
import type { PlayerProfile } from "@/types/domain";

export interface CompareRouteData {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
  path: string;
  entityId: string;
}

export async function loadCompareRouteData(
  playerOneSlug: string,
  playerTwoSlug: string,
): Promise<CompareRouteData> {
  if (!isValidCompareSlugPair(playerOneSlug, playerTwoSlug)) {
    notFound();
  }

  const [playerOne, playerTwo] = await Promise.all([
    getPlayerProfileBySlug(playerOneSlug),
    getPlayerProfileBySlug(playerTwoSlug),
  ]);

  if (!playerOne || !playerTwo) {
    notFound();
  }

  return {
    playerOne,
    playerTwo,
    path: comparePath(playerOneSlug, playerTwoSlug),
    entityId: compareEntityId(playerOneSlug, playerTwoSlug),
  };
}

export async function createCompareMetadata(
  playerOneSlug: string,
  playerTwoSlug: string,
  options?: {
    season?: string | null;
    year?: string | null;
  },
): Promise<Metadata> {
  const basePath = comparePath(playerOneSlug, playerTwoSlug);
  const params = new URLSearchParams();
  if (options?.season?.trim()) {
    params.set("season", options.season.trim());
  }
  if (options?.year?.trim()) {
    params.set("year", options.year.trim());
  }
  const query = params.toString();
  const path = query ? `${basePath}?${query}` : basePath;

  if (!isValidCompareSlugPair(playerOneSlug, playerTwoSlug)) {
    return createPageMetadata({
      title: "Comparison not found",
      description: "This player comparison does not exist.",
      path,
      noIndex: true,
    });
  }

  const [playerOne, playerTwo] = await Promise.all([
    getPlayerProfileBySlug(playerOneSlug),
    getPlayerProfileBySlug(playerTwoSlug),
  ]);

  if (!playerOne || !playerTwo) {
    return createPageMetadata({
      title: "Comparison not found",
      description: "This player comparison does not exist.",
      path,
      noIndex: true,
    });
  }

  const nameOne = playerOne.player.name;
  const nameTwo = playerTwo.player.name;
  const shortOne = playerOne.player.short_name;
  const shortTwo = playerTwo.player.short_name;
  const seasonLabel = options?.season?.trim() || options?.year?.trim();
  const titleSuffix = seasonLabel ? ` (${seasonLabel})` : "";

  return createPageMetadata({
    title: `${shortOne} vs ${shortTwo} Career Comparison${titleSuffix}`,
    description: `${nameOne} vs ${nameTwo}${seasonLabel ? ` — ${seasonLabel} season` : ""} — career goals, club vs country, Champions League, trophies, and head-to-head stats.`,
    path,
    keywords: [
      `${shortOne} vs ${shortTwo}`,
      `${nameOne} vs ${nameTwo}`,
      `${shortOne} vs ${shortTwo} stats`,
      seasonLabel ? `${shortOne} vs ${shortTwo} ${seasonLabel}` : "",
      "football player comparison",
    ].filter(Boolean),
  });
}

export function isCompareSlugFormatValid(slug: string): boolean {
  return isValidPlayerSlugFormat(slug);
}
