import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createSearchSessionId,
  getSearchSessionCookieOptions,
  isValidSearchSessionId,
  SEARCH_SESSION_COOKIE_NAME,
} from "@/lib/search/session-cookie";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  legacySessionId: z.string().trim().min(8).max(64).optional(),
});

async function ensureSessionCookie(legacySessionId?: string | null) {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SEARCH_SESSION_COOKIE_NAME)?.value;

  if (isValidSearchSessionId(existing)) {
    return existing.trim();
  }

  const sessionId =
    isValidSearchSessionId(legacySessionId) && legacySessionId
      ? legacySessionId.trim()
      : createSearchSessionId();

  cookieStore.set(
    SEARCH_SESSION_COOKIE_NAME,
    sessionId,
    getSearchSessionCookieOptions(),
  );

  return sessionId;
}

export async function GET() {
  await ensureSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  await ensureSessionCookie(parsed.data.legacySessionId);
  return NextResponse.json({ ok: true });
}
