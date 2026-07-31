import { describe, expect, it, beforeEach } from "vitest";

import {
  checkRateLimit,
  resetRateLimitBuckets,
  SEARCH_API_RATE_LIMIT,
} from "@/lib/api/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitBuckets();
  });

  it("allows requests under the limit", () => {
    const first = checkRateLimit("client-a", 3, 60_000, 1_000);
    const second = checkRateLimit("client-a", 3, 60_000, 2_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks requests over the limit", () => {
    checkRateLimit("client-a", 2, 60_000, 1_000);
    checkRateLimit("client-a", 2, 60_000, 2_000);
    const blocked = checkRateLimit("client-a", 2, 60_000, 3_000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window expires", () => {
    checkRateLimit("client-a", 1, 1_000, 1_000);
    const blocked = checkRateLimit("client-a", 1, 1_000, 1_500);
    const allowed = checkRateLimit("client-a", 1, 1_000, 2_100);

    expect(blocked.allowed).toBe(false);
    expect(allowed.allowed).toBe(true);
  });

  it("tracks clients independently", () => {
    checkRateLimit("client-a", 1, 60_000, 1_000);
    const otherClient = checkRateLimit("client-b", 1, 60_000, 1_000);

    expect(otherClient.allowed).toBe(true);
  });

  it("uses the search API defaults", () => {
    expect(SEARCH_API_RATE_LIMIT.limit).toBe(30);
    expect(SEARCH_API_RATE_LIMIT.windowMs).toBe(60_000);
  });
});
