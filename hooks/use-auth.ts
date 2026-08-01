"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  email: string | null;
  loading: boolean;
  configured: boolean;
}

/**
 * Shared client auth state — subscribe once, reuse in nav, favorites, etc.
 */
export function useAuth(): AuthState {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  return {
    user,
    email: user?.email ?? null,
    loading,
    configured,
  };
}
