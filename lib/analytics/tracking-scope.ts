import { cookies } from "next/headers";

import {
  createVisitorId,
  getVisitorCookieOptions,
  isValidVisitorId,
  VISITOR_COOKIE_NAME,
} from "@/lib/analytics/visitor-cookie";
import {
  isValidSearchSessionId,
  SEARCH_SESSION_COOKIE_NAME,
} from "@/lib/search/session-cookie";

export interface AnalyticsTrackingScope {
  sessionId: string | null;
  visitorId: string | null;
}

export async function ensureAnalyticsVisitorId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE_NAME)?.value;

  if (isValidVisitorId(existing)) {
    return existing.trim();
  }

  const visitorId = createVisitorId();
  cookieStore.set(VISITOR_COOKIE_NAME, visitorId, getVisitorCookieOptions());
  return visitorId;
}

export async function resolveAnalyticsTrackingScope(): Promise<AnalyticsTrackingScope> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SEARCH_SESSION_COOKIE_NAME)?.value;
  const visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value;

  return {
    sessionId: isValidSearchSessionId(sessionId) ? sessionId.trim() : null,
    visitorId: isValidVisitorId(visitorId) ? visitorId.trim() : null,
  };
}
