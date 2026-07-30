import { NextResponse } from "next/server";

import { importPlayerByApiId } from "@/services/players/player-import.service";
import { assertCronAuthorized } from "@/services/sync/sync.service";
import { ServiceError } from "@/services/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ImportBody {
  apiFootballId?: number;
  slug?: string;
}

/**
 * Import a player from API-Football into Supabase, then sync season rows.
 * Auth: Authorization: Bearer $CRON_SECRET
 */
export async function POST(request: Request) {
  try {
    assertCronAuthorized(request.headers.get("authorization"));
    const body = (await request.json()) as ImportBody;

    if (!body.apiFootballId || !Number.isFinite(body.apiFootballId)) {
      throw new ServiceError(
        "apiFootballId is required.",
        "IMPORT_INVALID_BODY",
      );
    }

    const result = await importPlayerByApiId(body.apiFootballId, body.slug);

    return NextResponse.json({ ok: true, ...result });
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
      { ok: false, message: "Unexpected import failure" },
      { status: 500 },
    );
  }
}
