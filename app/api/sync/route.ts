import { NextResponse } from "next/server";

import { ServiceError } from "@/services/errors";
import {
  assertCronAuthorized,
  runSyncJob,
  type SyncJob,
} from "@/services/sync/sync.service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function parseJob(value: string | null): SyncJob {
  if (value === "players" || value === "fixtures" || value === "all") {
    return value;
  }
  return "all";
}

function parseOptionalInt(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Protected sync endpoint.
 * Auth: Authorization: Bearer $CRON_SECRET
 * Jobs: ?job=players|fixtures|all
 * Batching: ?offset=0&limit=25&delayMs=600 (alphabetical by slug)
 *
 * Decision: never expose API-Football key to the browser; Vercel Cron + manual
 * admin calls hit this route only.
 */
export async function POST(request: Request) {
  try {
    assertCronAuthorized(request.headers.get("authorization"));
    const { searchParams } = new URL(request.url);
    const job = parseJob(searchParams.get("job"));
    const result = await runSyncJob(job, {
      offset: parseOptionalInt(searchParams.get("offset")),
      limit: parseOptionalInt(searchParams.get("limit")),
      delayMs: parseOptionalInt(searchParams.get("delayMs")),
    });

    return NextResponse.json({
      ...result,
      ok: true,
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
      { ok: false, message: "Unexpected sync failure" },
      { status: 500 },
    );
  }
}

/** GET supported for Vercel Cron (same auth). */
export async function GET(request: Request) {
  return POST(request);
}
