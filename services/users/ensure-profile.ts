import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoError } from "@/services/errors";

/**
 * Ensure public.users row exists for the auth user (trigger is primary path).
 */
export async function ensureUserProfile(
  userId: string,
  email: string | null,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const displayName = email?.split("@")[0] || "Fan";

  const result = await supabase.from("users").upsert(
    {
      id: userId,
      display_name: displayName,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  assertNoError(result.error, "Failed to ensure user profile");
}
