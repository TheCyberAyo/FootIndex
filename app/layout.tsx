import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { AppProviders } from "@/components/providers/app-providers";
import { JsonLd } from "@/components/seo/json-ld";
import { fontBody, fontDisplay } from "@/lib/fonts";
import { getPublicEnv } from "@/lib/env";
import { rootMetadata } from "@/lib/seo";
import { createWebSiteJsonLd } from "@/lib/seo/json-ld";

import "./globals.css";

export const metadata = rootMetadata;

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Root layout stays a Server Component.
 * Providers + interactive chrome are isolated client islands.
 * Decision: default dark via next-themes; light is optional (Phase 7).
 */
export default function RootLayout({ children }: RootLayoutProps) {
  const { gaMeasurementId, adsenseClientId } = getPublicEnv();

  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable}`}
      suppressHydrationWarning
    >
      <head>
        {adsenseClientId ? (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('consent', 'default', {
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied',
                    analytics_storage: 'denied',
                    wait_for_update: 500
                  });
                `,
              }}
            />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
              crossOrigin="anonymous"
            />
          </>
        ) : null}
      </head>
      <body className="min-h-dvh bg-background font-body text-foreground antialiased">
        {gaMeasurementId ? (
          <GoogleAnalytics measurementId={gaMeasurementId} />
        ) : null}
        <JsonLd data={createWebSiteJsonLd()} />
        <AppProviders adsenseEnabled={Boolean(adsenseClientId)}>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
