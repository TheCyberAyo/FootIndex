import { NextResponse } from "next/server";
import { z } from "zod";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  addFavorite,
  isFavorite,
  listUserFavorites,
  removeFavorite,
} from "@/services/favorites/favorites.service";

export const dynamic = "force-dynamic";

const entitySchema = z.enum(["player", "team", "comparison"]);

const querySchema = z.object({
  entityType: entitySchema.optional(),
  playerId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  playerOneId: z.string().uuid().optional(),
  playerTwoId: z.string().uuid().optional(),
});

const bodySchema = querySchema.extend({
  entityType: entitySchema,
});

async function requireUserId(): Promise<string | NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return user.id;
}

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) {
    return userId;
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    entityType: searchParams.get("entityType") ?? undefined,
    playerId: searchParams.get("playerId") ?? undefined,
    teamId: searchParams.get("teamId") ?? undefined,
    playerOneId: searchParams.get("playerOneId") ?? undefined,
    playerTwoId: searchParams.get("playerTwoId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  if (parsed.data.entityType) {
    const active = await isFavorite({
      userId,
      entityType: parsed.data.entityType,
      playerId: parsed.data.playerId,
      teamId: parsed.data.teamId,
      playerOneId: parsed.data.playerOneId,
      playerTwoId: parsed.data.playerTwoId,
    });

    return NextResponse.json({ active });
  }

  const favorites = await listUserFavorites(userId);
  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) {
    return userId;
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await addFavorite({
    userId,
    entityType: parsed.data.entityType,
    playerId: parsed.data.playerId,
    teamId: parsed.data.teamId,
    playerOneId: parsed.data.playerOneId,
    playerTwoId: parsed.data.playerTwoId,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) {
    return userId;
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await removeFavorite({
    userId,
    entityType: parsed.data.entityType,
    playerId: parsed.data.playerId,
    teamId: parsed.data.teamId,
    playerOneId: parsed.data.playerOneId,
    playerTwoId: parsed.data.playerTwoId,
  });

  return NextResponse.json({ ok: true });
}
