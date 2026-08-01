import { NextResponse } from "next/server";

import { resolveAuthNextPath } from "@/lib/auth/paths";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Exchange auth code for session cookies (magic link + OAuth).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = resolveAuthNextPath(url.searchParams.get("next"));

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?error=config", url.origin));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const params = new URLSearchParams({
        error: error.message,
        next,
      });
      return NextResponse.redirect(
        new URL(`/login?${params.toString()}`, url.origin),
      );
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
