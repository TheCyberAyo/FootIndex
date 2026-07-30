import { NextResponse } from "next/server";

import type { WorldRegion } from "@/lib/data/world-teams";
import { importWorldSquads } from "@/services/players/world-import.service";
import { assertCronAuthorized } from "@/services/sync/sync.service";
import { ServiceError } from "@/services/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const REGIONS = new Set<WorldRegion>([
  "all",
  "europe",
  "americas",
  "africa",
  "asia",
  "oceania",
]);

function parseRegion(value: string | null): WorldRegion {
  if (value && REGIONS.has(value as WorldRegion)) {
    return value as WorldRegion;
  }
  return "all";
}

/**
 * Bulk-import player squads from clubs worldwide.
 * Auth: Authorization: Bearer $CRON_SECRET
 *
 * Query params:
 * - region=all|europe|americas|africa|asia|oceania
 * - offset=0 (skip first N teams — use with maxTeams for batched imports)
 * - maxTeams=10 (optional cap)
 * - sync=true (optional — 1 API call per player; expensive on free plan)
 * - delayMs=350 (pause between team squad fetches)
 */
export async function POST(request: Request) {
  try {
    assertCronAuthorized(request.headers.get("authorization"));
    const { searchParams } = new URL(request.url);

    const region = parseRegion(searchParams.get("region"));
    const offsetRaw = searchParams.get("offset");
    const offset = offsetRaw ? Number(offsetRaw) : undefined;
    const maxTeamsRaw = searchParams.get("maxTeams");
    const maxTeams = maxTeamsRaw ? Number(maxTeamsRaw) : undefined;
    const sync = searchParams.get("sync") === "true";
    const delayMsRaw = searchParams.get("delayMs");
    const delayMs = delayMsRaw ? Number(delayMsRaw) : undefined;

    const summary = await importWorldSquads({
      region,
      offset: Number.isFinite(offset) ? offset : undefined,
      maxTeams: Number.isFinite(maxTeams) ? maxTeams : undefined,
      sync,
      delayMs: Number.isFinite(delayMs) ? delayMs : undefined,
    });

    return NextResponse.json({
      ok: true,
      region,
      offset: Number.isFinite(offset) ? offset : 0,
      sync,
      ...summary,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      const status =
        error.code === "SYNC_UNAUTHORIZED"
          ? 401
          : error.code === "CRON_SECRET_MISSING"
            ? 503
            : 400;
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status },
      );
    }

    return NextResponse.json(
      { ok: false, message: "Unexpected world import failure" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
