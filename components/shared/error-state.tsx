import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorStateVariant =
  | "generic"
  | "network"
  | "notFound"
  | "offline"
  | "api";

interface ErrorStateProps {
  variant?: ErrorStateVariant;
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

const COPY: Record<
  ErrorStateVariant,
  { eyebrow: string; title: string; message: string }
> = {
  generic: {
    eyebrow: "Error",
    title: "We hit a snag",
    message: "Something went wrong. Please try again.",
  },
  network: {
    eyebrow: "Network",
    title: "Connection problem",
    message: "Check your connection and try again.",
  },
  offline: {
    eyebrow: "Offline",
    title: "You are offline",
    message: "Reconnect to load the latest stats.",
  },
  api: {
    eyebrow: "API",
    title: "Data unavailable",
    message: "We could not load data right now. Try again shortly.",
  },
  notFound: {
    eyebrow: "404",
    title: "Offside",
    message: "That page does not exist.",
  },
};

/**
 * Standardised error UI with retry (spec §192).
 */
export function ErrorState({
  variant = "generic",
  title,
  message,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  const defaults = COPY[variant];

  return (
    <div
      className={cn(
        "mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center",
        className,
      )}
      role="alert"
    >
      <p className="mb-3 text-caption font-semibold tracking-[0.2em] text-brand uppercase">
        {defaults.eyebrow}
      </p>
      <h1 className="font-display text-h1 text-foreground sm:text-4xl">
        {title ?? defaults.title}
      </h1>
      <p className="mt-3 text-body-sm text-muted-foreground sm:text-body">
        {message ?? defaults.message}
      </p>
      {onRetry ? (
        <Button
          type="button"
          variant="brand"
          className="mt-8"
          onClick={onRetry}
        >
          Try again
        </Button>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}
