"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthMenuProps {
  compact?: boolean;
}

export function AuthMenu({ compact = false }: AuthMenuProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setEmail(null);
    router.refresh();
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
          <span className="hidden max-w-[140px] truncate text-xs text-foreground/50 lg:inline">
            {email}
          </span>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handleSignOut}
          className="border-border bg-transparent text-foreground hover:bg-white/10"
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      asChild
      variant="outline"
      size={compact ? "sm" : "default"}
      className="border-border bg-transparent text-foreground hover:bg-white/10"
    >
      <Link href="/login">Sign in</Link>
    </Button>
  );
}
