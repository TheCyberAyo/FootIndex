import type { ReactNode } from "react";

import { GlassCard } from "@/components/shared/glass-card";

interface ProseSectionProps {
  title: string;
  children: ReactNode;
}

/**
 * Simple titled prose block for legal / contact pages.
 */
export function ProseSection({ title, children }: ProseSectionProps) {
  return (
    <GlassCard className="p-5 sm:p-6" as="article">
      <h2 className="font-display text-xl font-bold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/65">
        {children}
      </div>
    </GlassCard>
  );
}
