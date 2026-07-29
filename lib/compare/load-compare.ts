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
): Promise<Metadata> {
  const path = comparePath(playerOneSlug, playerTwoSlug);

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

  return createPageMetadata({
    title: `${shortOne} vs ${shortTwo} Career Comparison`,
    description: `${nameOne} vs ${nameTwo} — career goals, club vs country, Champions League, trophies, and head-to-head stats.`,
    path,
    keywords: [
      `${shortOne} vs ${shortTwo}`,
      `${nameOne} vs ${nameTwo}`,
      `${shortOne} vs ${shortTwo} stats`,
      "football player comparison",
    ],
  });
}

export function isCompareSlugFormatValid(slug: string): boolean {
  return isValidPlayerSlugFormat(slug);
}
