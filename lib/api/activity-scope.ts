import { cookies } from "next/headers";

import { isSupabaseConfigured } from "@/lib/env";
import {
  isValidSearchSessionId,
  SEARCH_SESSION_COOKIE_NAME,
} from "@/lib/search/session-cookie";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ActivityScope {
  userId: string | null;
  sessionId: string | null;
}

export async function resolveActivityScope(input: {
  request: Request;
  sessionId?: string | null;
}): Promise<ActivityScope> {
  let userId: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Auth optional for anonymous activity.
    }
  }

  const cookieStore = await cookies();
  const cookieSessionId = cookieStore.get(SEARCH_SESSION_COOKIE_NAME)?.value;
  const sessionId = isValidSearchSessionId(cookieSessionId)
    ? cookieSessionId.trim()
    : input.sessionId?.trim() || null;

  return {
    userId,
    sessionId,
  };
}

export function hasActivityScope(scope: ActivityScope): boolean {
  return Boolean(scope.userId || scope.sessionId);
}
