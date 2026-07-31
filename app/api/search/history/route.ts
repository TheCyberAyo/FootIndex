import { NextResponse } from "next/server";
import { z } from "zod";

import {
  hasActivityScope,
  resolveActivityScope,
} from "@/lib/api/activity-scope";
import { isSupabaseConfigured } from "@/lib/env";
import {
  clearSearchHistory,
  listRecentSearchEntries,
  recordSearchHistory,
} from "@/services/search/search-history.service";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  searchTerm: z.string().trim().min(2).max(80),
  playerId: z.string().uuid().optional(),
  sessionId: z.string().trim().min(8).max(64).optional(),
});

const deleteSchema = z.object({
  sessionId: z.string().trim().min(8).max(64).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const scope = await resolveActivityScope({
    request,
    sessionId: parsed.data.sessionId,
  });

  await recordSearchHistory({
    searchTerm: parsed.data.searchTerm,
    playerId: parsed.data.playerId ?? null,
    userId: scope.userId,
    sessionId: scope.sessionId,
  });

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : 8;
  const boundedLimit = Number.isFinite(limit) ? limit : 8;

  const scope = await resolveActivityScope({ request, sessionId });

  if (scope.userId) {
    const entries = await listRecentSearchEntries({
      userId: scope.userId,
      limit: boundedLimit,
    });
    return NextResponse.json({ entries });
  }

  if (!scope.sessionId) {
    return NextResponse.json({ entries: [] });
  }

  const entries = await listRecentSearchEntries({
    sessionId: scope.sessionId,
    limit: boundedLimit,
  });

  return NextResponse.json({ entries });
}

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const scope = await resolveActivityScope({
    request,
    sessionId: parsed.data.sessionId,
  });

  if (!hasActivityScope(scope)) {
    return NextResponse.json({ ok: false, error: "Missing scope" }, { status: 400 });
  }

  await clearSearchHistory(scope);
  return NextResponse.json({ ok: true });
}
