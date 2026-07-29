import { NextResponse } from "next/server";
import { z } from "zod";

import { isSupabaseConfigured } from "@/lib/env";
import { searchPlayers } from "@/services";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().min(2).max(80),
  limit: z.coerce.number().int().min(1).max(25).optional(),
});

/**
 * Player search API — Supabase FTS, never Football API (PROJECT_SPEC §43).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters.", results: [] },
      { status: 400 },
    );
  }

  const results = await searchPlayers(parsed.data.q, parsed.data.limit);

  return NextResponse.json({
    dataSource: isSupabaseConfigured() ? "supabase" : "local-seed",
    query: parsed.data.q,
    count: results.length,
    results,
  });
}
