import { NextResponse } from "next/server";
import { z } from "zod";

import {
  hasActivityScope,
  resolveActivityScope,
} from "@/lib/api/activity-scope";
import { isSupabaseConfigured } from "@/lib/env";
import {
  clearPlayerViews,
  listRecentlyViewedPlayers,
  recordPlayerView,
} from "@/services/players/player-views.service";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  playerId: z.string().uuid(),
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

  await recordPlayerView({
    playerId: parsed.data.playerId,
    userId: scope.userId,
    sessionId: scope.sessionId,
  });

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const excludeSlug = searchParams.get("excludeSlug");
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : 8;
  const boundedLimit = Number.isFinite(limit) ? limit : 8;

  const scope = await resolveActivityScope({ request, sessionId });

  if (scope.userId) {
    const players = await listRecentlyViewedPlayers({
      userId: scope.userId,
      limit: boundedLimit,
      excludeSlug,
    });
    return NextResponse.json({ players });
  }

  if (!scope.sessionId) {
    return NextResponse.json({ players: [] });
  }

  const players = await listRecentlyViewedPlayers({
    sessionId: scope.sessionId,
    limit: boundedLimit,
    excludeSlug,
  });

  return NextResponse.json({ players });
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

  await clearPlayerViews(scope);
  return NextResponse.json({ ok: true });
}
