import { NextResponse } from "next/server";
import { z } from "zod";

import {
  listRecentSearchTerms,
  recordSearchHistory,
} from "@/services/search/search-history.service";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  searchTerm: z.string().trim().min(2).max(80),
  playerId: z.string().uuid().optional(),
  sessionId: z.string().trim().min(8).max(64).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  await recordSearchHistory({
    searchTerm: parsed.data.searchTerm,
    playerId: parsed.data.playerId ?? null,
    sessionId: parsed.data.sessionId ?? null,
  });

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : 8;

  if (!sessionId) {
    return NextResponse.json({ terms: [] });
  }

  const terms = await listRecentSearchTerms({
    sessionId,
    limit: Number.isFinite(limit) ? limit : 8,
  });

  return NextResponse.json({ terms });
}
