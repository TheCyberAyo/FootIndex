import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveActivityScope } from "@/lib/api/activity-scope";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recordComparisonView } from "@/services/compare/comparison-views.service";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  playerOneId: z.string().uuid(),
  playerTwoId: z.string().uuid(),
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

  await recordComparisonView(parsed.data.playerOneId, parsed.data.playerTwoId, {
    userId: scope.userId,
    sessionId: scope.sessionId,
  });

  return NextResponse.json({ ok: true });
}
