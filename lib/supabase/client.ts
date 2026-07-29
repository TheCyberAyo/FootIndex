import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Browser Supabase client (Client Components).
 * Uses anon key + RLS. Never import service role in the browser.
 */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
