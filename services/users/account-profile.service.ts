import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoError } from "@/services/errors";

export interface AccountProfile {
  displayName: string;
  avatarUrl: string | null;
  memberSince: string;
  favoritesCount: number;
}

export async function getAccountProfile(userId: string): Promise<AccountProfile | null> {
  const supabase = await createSupabaseServerClient();

  const [profileResult, favoritesResult] = await Promise.all([
    supabase
      .from("users")
      .select("display_name, avatar_url, created_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("user_favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  assertNoError(profileResult.error, "Failed to load account profile");
  assertNoError(favoritesResult.error, "Failed to load favorites count");

  if (!profileResult.data) {
    return null;
  }

  return {
    displayName: profileResult.data.display_name,
    avatarUrl: profileResult.data.avatar_url,
    memberSince: profileResult.data.created_at,
    favoritesCount: favoritesResult.count ?? 0,
  };
}
