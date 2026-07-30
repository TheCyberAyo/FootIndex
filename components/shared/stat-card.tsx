import type { ReactNode } from "react";

import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
  className?: string;
}

/**
 * Reusable stat display card (spec §183).
 */
export function StatCard({
  label,
  value,
  icon,
  hint,
  className,
}: StatCardProps) {
  return (
    <GlassCard className={cn("p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption tracking-[0.18em] text-muted-foreground uppercase">
          {label}
        </p>
        {icon ? (
          <div className="text-muted-foreground" aria-hidden="true">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-3 font-display text-stat text-foreground">{value}</p>
      {hint ? (
        <p className="mt-2 text-body-sm text-muted-foreground">{hint}</p>
      ) : null}
    </GlassCard>
  );
}
