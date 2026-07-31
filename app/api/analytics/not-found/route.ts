import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ensureAnalyticsVisitorId,
  resolveAnalyticsTrackingScope,
} from "@/lib/analytics/tracking-scope";
import {
  checkRateLimit,
  getClientIp,
  SEARCH_API_RATE_LIMIT,
} from "@/lib/api/rate-limit";
import { recordSiteNotFound } from "@/services/analytics/site-analytics.service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  path: z.string().trim().min(1).max(500),
  referrer: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(
    `analytics-not-found:${ip}`,
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

  await ensureAnalyticsVisitorId();
  const tracking = await resolveAnalyticsTrackingScope();

  await recordSiteNotFound({
    sessionId: tracking.sessionId,
    visitorId: tracking.visitorId,
    path: parsed.data.path,
    referrer: parsed.data.referrer,
  });

  return NextResponse.json({ ok: true });
}
