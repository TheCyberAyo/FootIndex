"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { loginPath, signUpPath } from "@/lib/auth/paths";

interface AuthMenuProps {
  compact?: boolean;
}

export function AuthMenu({ compact = false }: AuthMenuProps) {
  const router = useRouter();
  const { email, loading, configured } = useAuth();

  async function handleSignOut() {
    if (!configured) {
      return;
    }

    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (!configured) {
    return null;
  }

  if (loading) {
    return (
      <Button
        type="button"
        variant="ghost"
        size={compact ? "sm" : "default"}
        className="text-foreground/50"
        disabled
      >
        …
      </Button>
    );
  }

  if (email) {
    return (
      <div className="flex items-center gap-2">
        {!compact ? (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden text-foreground/70 lg:inline-flex"
          >
            <Link href="/favorites">Favorites</Link>
          </Button>
        ) : null}
        {!compact ? (
          <span className="hidden max-w-[140px] truncate text-xs text-foreground/50 lg:inline">
            {email}
          </span>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={() => void handleSignOut()}
          className="border-border bg-transparent text-foreground hover:bg-white/10"
        >
          Sign out
        </Button>
      </div>
    );
  }

  if (compact) {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-border bg-transparent text-foreground hover:bg-white/10"
      >
        <Link href={loginPath()}>Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-foreground/80 hover:text-foreground"
      >
        <Link href={loginPath()}>Sign in</Link>
      </Button>
      <Button
        asChild
        variant="brand"
        size="sm"
      >
        <Link href={signUpPath()}>Create account</Link>
      </Button>
    </div>
  );
}
