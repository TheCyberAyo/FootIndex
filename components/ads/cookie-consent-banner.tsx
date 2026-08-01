"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getStoredConsent,
  setStoredConsent,
  type CookieConsentChoice,
} from "@/lib/ads/consent";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsentChoice(choice: CookieConsentChoice): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  if (choice === "accepted") {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    return;
  }

  window.gtag("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}

interface CookieConsentBannerProps {
  enabled: boolean;
}

/**
 * GDPR-friendly consent banner for advertising (and optional analytics) cookies.
 */
export function CookieConsentBanner({ enabled }: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setVisible(getStoredConsent() === null);
  }, [enabled]);

  if (!enabled || !visible) {
    return null;
  }

  const handleChoice = (choice: CookieConsentChoice) => {
    setStoredConsent(choice);
    applyConsentChoice(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-surface-black/95 p-4 backdrop-blur-md sm:p-5",
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-white/75">
          We use cookies for essential site features, analytics, and advertising
          through Google AdSense. See our{" "}
          <Link href="/privacy" className="text-brand hover:underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => handleChoice("declined")}
          >
            Essential only
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-brand text-surface-black hover:bg-brand/90"
            onClick={() => handleChoice("accepted")}
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
