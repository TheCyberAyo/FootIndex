import { NextResponse } from "next/server";

import { resolveActivityScope } from "@/lib/api/activity-scope";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mergeComparisonViewsForUser } from "@/services/compare/comparison-views.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const scope = await resolveActivityScope({ request });

  if (!scope.sessionId) {
    return NextResponse.json({ ok: false, error: "Missing session" }, { status: 400 });
  }

  await mergeComparisonViewsForUser({
    sessionId: scope.sessionId,
    userId: user.id,
  });

  return NextResponse.json({ ok: true });
}
