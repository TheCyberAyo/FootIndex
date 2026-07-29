"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface ErrorResetProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Client-only error recovery UI.
 * Decision: keep error.tsx thin; shared messaging lives here for reuse.
 */
export function ErrorReset({ error, reset }: ErrorResetProps) {
  const [message, setMessage] = useState("Something went wrong.");

  useEffect(() => {
    setMessage(error.message || "Something went wrong.");
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
        Error
      </p>
      <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
        We hit a snag
      </h1>
      <p className="mt-3 text-sm text-white/60 sm:text-base">{message}</p>
      <Button
        type="button"
        onClick={reset}
        className="mt-8 bg-brand text-brand-foreground hover:bg-brand/90"
      >
        Try again
      </Button>
    </div>
  );
}
