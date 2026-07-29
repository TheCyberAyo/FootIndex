import { createClient } from "@supabase/supabase-js";

import { getServerEnv, isSupabaseAdminConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Service-role client for trusted server jobs (Phase 3 sync).
 * Decision: never expose this to the browser; bypasses RLS by design.
 */
export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error(
      "Supabase admin is not configured. Set URL, anon key, and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getServerEnv();

  return createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
