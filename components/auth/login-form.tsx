"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { authRedirectUrl } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface LoginFormProps {
  nextPath?: string;
  onSuccessMessage?: (message: string) => void;
}

export function LoginForm({
  nextPath = "/compare#vote",
  onSuccessMessage,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseConfigured()) {
      setStatus("error");
      setMessage("Supabase is not configured in this environment.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: authRedirectUrl(nextPath),
        },
      });

      if (error) {
        throw error;
      }

      setStatus("sent");
      const success =
        "Magic link sent. Check your email to finish signing in.";
      setMessage(success);
      onSuccessMessage?.(success);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not send magic link.",
      );
    }
  }

  async function handleGoogle() {
    if (!isSupabaseConfigured()) {
      setStatus("error");
      setMessage("Supabase is not configured in this environment.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: authRedirectUrl(nextPath),
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Google sign-in failed.",
      );
    }
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={handleMagicLink} className="grid gap-3">
        <label className="grid gap-1.5 text-sm">
          <span className="text-foreground/70">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-xl border border-border bg-background/40 px-3 text-foreground outline-none ring-brand focus:ring-2"
          />
        </label>
        <Button
          type="submit"
          disabled={status === "loading"}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          {status === "loading" ? "Sending…" : "Email magic link"}
        </Button>
      </form>

      <div className="relative py-1 text-center text-xs text-foreground/40">
        <span className="bg-popover px-2">or</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={status === "loading"}
        onClick={handleGoogle}
        className="border-border bg-transparent text-foreground hover:bg-white/10"
      >
        Continue with Google
      </Button>

      {message ? (
        <p
          className={
            status === "error"
              ? "text-sm text-red-400"
              : "text-sm text-foreground/60"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
