"use client";

import { Suspense, type ReactNode } from "react";

import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SearchHistoryAuthSync } from "@/components/search/search-history-auth-sync";
import { SearchSessionBootstrap } from "@/components/search/search-session-bootstrap";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Single client boundary for app-wide providers.
 * Keeps root layout as a Server Component while allowing React Query + theme.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SearchSessionBootstrap />
        <SearchHistoryAuthSync />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
