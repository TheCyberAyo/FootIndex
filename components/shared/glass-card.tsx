import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "aside" | "li";
  hover?: boolean;
}

/**
 * Glassmorphism surface used across home, players, and compare.
 * Decision: pure Tailwind + CSS variables (no Bootstrap, no extra CSS-in-JS).
 */
export function GlassCard({
  children,
  className,
  as: Component = "div",
  hover = false,
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        "rounded-2xl border border-glass-border bg-glass backdrop-blur-xl",
        "shadow-[inset_0_1px_0_0_var(--glass-highlight)]",
        hover &&
          "transition-[transform,background-color,border-color] duration-300 ease-[var(--ease-out-premium)] hover:-translate-y-0.5 hover:border-white/20 hover:bg-glass-strong",
        className,
      )}
    >
      {children}
    </Component>
  );
}
