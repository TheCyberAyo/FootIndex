import type { ReactNode } from "react";

import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";

interface ChartShellProps {
  title: string;
  description?: string;
  legend?: ReactNode;
  height: number;
  children: ReactNode;
  className?: string;
}

/**
 * Fixed-height glass chart frame — reserves space to avoid layout shift.
 */
export function ChartShell({
  title,
  description,
  legend,
  height,
  children,
  className,
}: ChartShellProps) {
  return (
    <GlassCard className={cn("flex flex-col p-4 sm:p-5", className)}>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-white">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs text-white/45 sm:text-sm">{description}</p>
          ) : null}
        </div>
        {legend ? <div className="shrink-0">{legend}</div> : null}
      </div>
      <div className="w-full" style={{ height }}>
        {children}
      </div>
    </GlassCard>
  );
}
