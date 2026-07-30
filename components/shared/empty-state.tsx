import type { ReactNode } from "react";

import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Reusable empty state — guides users with optional CTA (spec §191).
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard
      className={cn(
        "flex flex-col items-center px-6 py-10 text-center sm:px-8 sm:py-12",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-h3 text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-body-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </GlassCard>
  );
}
