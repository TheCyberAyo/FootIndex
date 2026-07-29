import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cookie-less anon client for public reads (RSC + Route Handlers).
 * Decision: keep auth/session client separate so ISR/static pages don't
 * trip on `cookies()` during prerender.
 */
export function createSupabasePublicClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
