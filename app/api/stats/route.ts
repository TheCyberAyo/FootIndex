import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import {
  getComparisonProfiles,
  listSeasonStatsByPlayerId,
} from "@/services";

export const dynamic = "force-dynamic";

/**
 * Aggregated stats for both players (season + career).
 */
export async function GET() {
  const comparison = await getComparisonProfiles();

  const [haalandSeasons, mbappeSeasons] = await Promise.all([
    listSeasonStatsByPlayerId(comparison.haaland.player.id),
    listSeasonStatsByPlayerId(comparison.mbappe.player.id),
  ]);

  return NextResponse.json({
    dataSource: isSupabaseConfigured() ? "supabase" : "local-seed",
    revalidateSeconds: 60,
    haaland: {
      player: {
        id: comparison.haaland.player.id,
        slug: comparison.haaland.player.slug,
        name: comparison.haaland.player.name,
        imageUrl: comparison.haaland.player.image_url,
        club: comparison.haaland.player.current_team?.name ?? null,
      },
      career: comparison.haaland.career,
      seasons: haalandSeasons,
    },
    mbappe: {
      player: {
        id: comparison.mbappe.player.id,
        slug: comparison.mbappe.player.slug,
        name: comparison.mbappe.player.name,
        imageUrl: comparison.mbappe.player.image_url,
        club: comparison.mbappe.player.current_team?.name ?? null,
      },
      career: comparison.mbappe.career,
      seasons: mbappeSeasons,
    },
  });
}
