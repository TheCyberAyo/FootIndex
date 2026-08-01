"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import {
  getStoredConsent,
  onConsentChange,
  type CookieConsentChoice,
} from "@/lib/ads/consent";
import { isAdPathExcluded } from "@/lib/ads/config";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  slotId: string;
  clientId: string;
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  fullWidthResponsive?: boolean;
  className?: string;
  minHeight?: number;
}

function updateGoogleConsent(choice: CookieConsentChoice): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  if (choice === "accepted") {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    return;
  }

  window.gtag("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Renders a single AdSense display unit. Waits for cookie consent and skips excluded routes.
 */
export function AdSlot({
  slotId,
  clientId,
  format = "auto",
  fullWidthResponsive = true,
  className,
  minHeight = 90,
}: AdSlotProps) {
  const pathname = usePathname();
  const pushedRef = useRef(false);
  const [consent, setConsent] = useState<CookieConsentChoice | null>(null);

  useEffect(() => {
    setConsent(getStoredConsent());
    return onConsentChange(setConsent);
  }, []);

  useEffect(() => {
    if (!consent || pushedRef.current || isAdPathExcluded(pathname)) {
      return;
    }

    updateGoogleConsent(consent);

    const pushAd = (): boolean => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push(
          consent === "declined" ? { requestNonPersonalizedAds: 1 } : {},
        );
        pushedRef.current = true;
        return true;
      } catch {
        return false;
      }
    };

    if (pushAd()) {
      return;
    }

    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      if (pushAd() || attempts >= 20) {
        window.clearInterval(interval);
      }
    }, 300);

    return () => window.clearInterval(interval);
  }, [consent, pathname]);

  if (!consent || isAdPathExcluded(pathname)) {
    return null;
  }

  return (
    <div
      className={cn("mx-auto w-full max-w-4xl", className)}
      style={{ minHeight }}
    >
      <p className="mb-2 text-center text-[10px] font-medium tracking-widest text-white/35 uppercase">
        Advertisement
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
