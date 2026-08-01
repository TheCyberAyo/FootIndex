"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AccountSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void handleSignOut()}
      className="border-border bg-transparent text-foreground hover:bg-white/10"
    >
      Sign out
    </Button>
  );
}
