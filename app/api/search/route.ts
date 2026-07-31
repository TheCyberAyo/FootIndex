import { NextResponse } from "next/server";
import { z } from "zod";

import {
  checkRateLimit,
  getClientIp,
  SEARCH_API_RATE_LIMIT,
} from "@/lib/api/rate-limit";
import { isSupabaseConfigured } from "@/lib/env";
import { parseSearchFilters } from "@/lib/search/filters";
import { searchPlayers } from "@/services";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().min(2).max(80),
  limit: z.coerce.number().int().min(1).max(25).optional(),
  position: z.string().optional(),
  nationality: z.string().optional(),
  club: z.string().optional(),
  competition: z.string().optional(),
  ageMin: z.coerce.number().int().min(15).max(45).optional(),
  ageMax: z.coerce.number().int().min(15).max(45).optional(),
});

/**
 * Player search API — Supabase FTS, never Football API (PROJECT_SPEC §43).
 */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(
    `search:${ip}`,
    SEARCH_API_RATE_LIMIT.limit,
    SEARCH_API_RATE_LIMIT.windowMs,
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many search requests. Try again shortly.", results: [] },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      q: searchParams.get("q") ?? "",
      limit: searchParams.get("limit") ?? undefined,
      position: searchParams.get("position") ?? undefined,
      nationality: searchParams.get("nationality") ?? undefined,
      club: searchParams.get("club") ?? undefined,
      competition: searchParams.get("competition") ?? undefined,
      ageMin: searchParams.get("ageMin") ?? undefined,
      ageMax: searchParams.get("ageMax") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters.", results: [] },
        { status: 400 },
      );
    }

    const filters = parseSearchFilters(parsed.data);
    const results = await searchPlayers(
      parsed.data.q,
      parsed.data.limit,
      filters,
    );

    return NextResponse.json(
      {
        dataSource: isSupabaseConfigured() ? "supabase" : "local-seed",
        query: parsed.data.q,
        count: results.length,
        results,
        filters,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=10, stale-while-revalidate=5",
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Player search failed";
    return NextResponse.json({ error: message, results: [] }, { status: 500 });
  }
}
