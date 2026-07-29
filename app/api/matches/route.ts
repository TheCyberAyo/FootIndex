import { NextResponse } from "next/server";

import { RECENT_MATCHES_PER_PLAYER } from "@/lib/api-football/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { listLiveScoreCards, listRecentMatches } from "@/services";

export const dynamic = "force-dynamic";

/**
 * Player appearances only — most recent N per player + card projection.
 */
export async function GET() {
  const liveCards = await listLiveScoreCards();
  const matches = await listRecentMatches(RECENT_MATCHES_PER_PLAYER * 2);
  const hasLive = liveCards.some((card) => card.match.status === "live");

  return NextResponse.json({
    dataSource: isSupabaseConfigured() ? "supabase" : "local-seed",
    revalidateSeconds: hasLive ? 15 : 30,
    hasLive,
    perPlayerLimit: RECENT_MATCHES_PER_PLAYER,
    matches,
    liveCards,
  });
}
