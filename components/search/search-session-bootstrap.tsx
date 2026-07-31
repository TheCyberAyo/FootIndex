"use client";

import { useEffect } from "react";

import { ensureSearchSession } from "@/lib/search/session";

/**
 * Ensures an HttpOnly search-session cookie exists before activity APIs run.
 */
export function SearchSessionBootstrap() {
  useEffect(() => {
    void ensureSearchSession();
  }, []);

  return null;
}
