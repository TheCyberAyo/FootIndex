"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ensureSearchSession } from "@/lib/search/session";

export function NotFoundTracker() {
  const pathname = usePathname();

  useEffect(() => {
    void ensureSearchSession().then(() =>
      fetch("/api/analytics/not-found", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer || undefined,
        }),
      }),
    );
  }, [pathname]);

  return null;
}
