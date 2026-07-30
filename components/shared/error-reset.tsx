"use client";

import { ErrorState } from "@/components/shared/error-state";

interface ErrorResetProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js error boundary wrapper around ErrorState.
 */
export function ErrorReset({ error, reset }: ErrorResetProps) {
  return (
    <ErrorState
      variant="generic"
      message={error.message || undefined}
      onRetry={reset}
    />
  );
}
