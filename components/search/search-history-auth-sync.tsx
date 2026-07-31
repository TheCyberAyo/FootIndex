"use client";

import { useEffect } from "react";

import { isSupabaseConfigured } from "@/lib/env";
import { mergePlayerViewsSession } from "@/lib/players/views";
import { mergeSearchHistorySession } from "@/lib/search/session";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Merges anonymous session activity into the authenticated user on sign-in.
 */
export function SearchHistoryAuthSync() {
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    async function mergeSessionActivity(userId: string) {
      await Promise.all([
        mergeSearchHistorySession(userId),
        mergePlayerViewsSession(userId),
      ]);
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        void mergeSessionActivity(data.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        void mergeSessionActivity(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
