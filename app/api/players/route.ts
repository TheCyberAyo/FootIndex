import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import {
  getComparisonProfiles,
  getVoteLeaderboard,
  listLiveScoreCards,
  listTeams,
} from "@/services";

export const dynamic = "force-dynamic";

/**
 * Read-only data snapshot for players + comparison.
 */
export async function GET() {
  const [comparison, teams, liveCards, votes] = await Promise.all([
    getComparisonProfiles(),
    listTeams(),
    listLiveScoreCards(),
    getVoteLeaderboard(),
  ]);

  return NextResponse.json({
    dataSource: isSupabaseConfigured() ? "supabase" : "local-seed",
    teams: teams.length,
    liveCards: liveCards.length,
    votes,
    players: {
      haaland: {
        id: comparison.haaland.player.id,
        slug: comparison.haaland.player.slug,
        club: comparison.haaland.player.current_team?.name ?? null,
        careerGoals: comparison.haaland.career?.goals ?? 0,
        goalsPerGame: comparison.haaland.career?.goals_per_game ?? 0,
        seasons: comparison.haaland.seasons.length,
        awards: comparison.haaland.awards.length,
        trophies: comparison.haaland.trophies.length,
      },
      mbappe: {
        id: comparison.mbappe.player.id,
        slug: comparison.mbappe.player.slug,
        club: comparison.mbappe.player.current_team?.name ?? null,
        careerGoals: comparison.mbappe.career?.goals ?? 0,
        goalsPerGame: comparison.mbappe.career?.goals_per_game ?? 0,
        seasons: comparison.mbappe.seasons.length,
        awards: comparison.mbappe.awards.length,
        trophies: comparison.mbappe.trophies.length,
      },
    },
  });
}
