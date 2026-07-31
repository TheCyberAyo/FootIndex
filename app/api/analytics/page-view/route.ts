import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ensureAnalyticsVisitorId,
  resolveAnalyticsTrackingScope,
} from "@/lib/analytics/tracking-scope";
import { resolveActivityScope } from "@/lib/api/activity-scope";
import {
  checkRateLimit,
  getClientIp,
  SEARCH_API_RATE_LIMIT,
} from "@/lib/api/rate-limit";
import { recordSitePageView } from "@/services/analytics/site-analytics.service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  path: z.string().trim().min(1).max(500),
  referrer: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(
    `analytics-page-view:${ip}`,
    SEARCH_API_RATE_LIMIT.limit,
    SEARCH_API_RATE_LIMIT.windowMs,
  );

  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const scope = await resolveActivityScope({ request });
  const visitorId = await ensureAnalyticsVisitorId();
  const tracking = await resolveAnalyticsTrackingScope();

  if (!tracking.sessionId) {
    return NextResponse.json({ ok: false, error: "Missing session" }, { status: 400 });
  }

  const result = await recordSitePageView({
    sessionId: tracking.sessionId,
    visitorId,
    path: parsed.data.path,
    referrer: parsed.data.referrer,
    userId: scope.userId,
  });

  return NextResponse.json({ ok: true, isReturning: result.isReturning });
}
