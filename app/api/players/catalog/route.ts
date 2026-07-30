import { NextResponse } from "next/server";

import { seedStarterPlayerCatalog } from "@/services/players/player-import.service";
import { assertCronAuthorized } from "@/services/sync/sync.service";
import { ServiceError } from "@/services/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Upsert marquee players from lib/data/starter-catalog.ts and sync each.
 * Auth: Authorization: Bearer $CRON_SECRET
 */
export async function POST(request: Request) {
  try {
    assertCronAuthorized(request.headers.get("authorization"));
    const results = await seedStarterPlayerCatalog();

    return NextResponse.json({
      ok: true,
      count: results.length,
      results,
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
      { ok: false, message: "Unexpected catalog seed failure" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
