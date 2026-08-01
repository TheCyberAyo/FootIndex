"use client";

import { Suspense, type ReactNode } from "react";

import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { CookieConsentBanner } from "@/components/ads/cookie-consent-banner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SearchHistoryAuthSync } from "@/components/search/search-history-auth-sync";
import { SearchSessionBootstrap } from "@/components/search/search-session-bootstrap";

interface AppProvidersProps {
  children: ReactNode;
  adsenseEnabled?: boolean;
}

/**
 * Single client boundary for app-wide providers.
 * Keeps root layout as a Server Component while allowing React Query + theme.
 */
export function AppProviders({
  children,
  adsenseEnabled = false,
}: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SearchSessionBootstrap />
        <SearchHistoryAuthSync />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <CookieConsentBanner enabled={adsenseEnabled} />
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
