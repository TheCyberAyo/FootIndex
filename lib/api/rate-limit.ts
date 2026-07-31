export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key);
  const safeLimit = Math.max(1, limit);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      limit: safeLimit,
      remaining: safeLimit - 1,
      retryAfterSeconds: 0,
    };
  }

  if (bucket.count >= safeLimit) {
    return {
      allowed: false,
      limit: safeLimit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed: true,
    limit: safeLimit,
    remaining: safeLimit - bucket.count,
    retryAfterSeconds: 0,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Reset buckets — for tests only. */
export function resetRateLimitBuckets(): void {
  buckets.clear();
}

export const SEARCH_API_RATE_LIMIT = {
  limit: 30,
  windowMs: 60_000,
} as const;
