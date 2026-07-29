import { NextResponse } from "next/server";

import { isApiFootballConfigured } from "@/lib/api-football/client";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { listPlayers } from "@/services";

export const dynamic = "force-dynamic";

/**
 * Health check reports launch-ready data-plane status (Phase 10).
 */
export async function GET() {
  const players = await listPlayers();

  return NextResponse.json({
    ok: true,
    service: "haaland-vs-mbappe",
    phase: 10,
    supabaseConfigured: isSupabaseConfigured(),
    supabaseAdminConfigured: isSupabaseAdminConfigured(),
    apiFootballConfigured: isApiFootballConfigured(),
    playerCount: players.length,
    dataSource: isSupabaseConfigured() ? "supabase" : "local-seed",
    sync: {
      endpoint: "/api/sync",
      auth: "Authorization: Bearer $CRON_SECRET",
      jobs: ["players", "fixtures", "all"],
    },
  });
}
