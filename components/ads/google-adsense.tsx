import Script from "next/script";

interface GoogleAdSenseProps {
  clientId: string;
}

/**
 * Loads the AdSense script. Consent defaults are set inline in the root layout
 * before this script runs.
 */
export function GoogleAdSense({ clientId }: GoogleAdSenseProps) {
  return (
    <Script
      id="google-adsense"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      strategy="afterInteractive"
    />
  );
}
