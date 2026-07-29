import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

interface SiteShellProps {
  children: ReactNode;
}

/**
 * App chrome: sticky glass header + main + footer.
 * Keeps layout concerns out of individual pages (SRP).
 */
export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-surface-black text-white">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
