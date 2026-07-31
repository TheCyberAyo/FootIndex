"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { ensureSearchSession } from "@/lib/search/session";

/**
 * Records page views for bounce rate and returning-visitor analytics.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    if (lastTrackedRef.current === path) {
      return;
    }

    lastTrackedRef.current = path;

    void ensureSearchSession().then(() =>
      fetch("/api/analytics/page-view", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          referrer: document.referrer || undefined,
        }),
      }),
    );
  }, [pathname, searchParams]);

  return null;
}
