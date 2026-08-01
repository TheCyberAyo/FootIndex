"use server";

import { revalidatePath } from "next/cache";

import { getAuthUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface UpdateDisplayNameResult {
  ok: boolean;
  error?: string;
}

export async function updateDisplayName(
  displayName: string,
): Promise<UpdateDisplayNameResult> {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const trimmed = displayName.trim();
  if (trimmed.length < 2 || trimmed.length > 40) {
    return {
      ok: false,
      error: "Display name must be between 2 and 40 characters.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from("users")
    .update({ display_name: trimmed })
    .eq("id", user.id);

  if (result.error) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/account");
  return { ok: true };
}
