/**
 * AdSense configuration — optional until publisher ID is set in production.
 * Slot IDs come from the AdSense dashboard after creating ad units.
 */

export const AD_SLOT_KEYS = [
  "home",
  "player",
  "compare",
  "news",
  "rankings",
] as const;

export type AdSlotKey = (typeof AD_SLOT_KEYS)[number];

const slotEnvKey: Record<AdSlotKey, string> = {
  home: "NEXT_PUBLIC_ADSENSE_SLOT_HOME",
  player: "NEXT_PUBLIC_ADSENSE_SLOT_PLAYER",
  compare: "NEXT_PUBLIC_ADSENSE_SLOT_COMPARE",
  news: "NEXT_PUBLIC_ADSENSE_SLOT_NEWS",
  rankings: "NEXT_PUBLIC_ADSENSE_SLOT_RANKINGS",
};

export function getAdSlotId(key: AdSlotKey): string | undefined {
  const value = process.env[slotEnvKey[key]];
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}

/** Paths where ads must not render (auth, admin, low-value). */
export const AD_EXCLUDED_PATH_PREFIXES = [
  "/admin",
  "/login",
  "/auth/",
  "/api-docs",
] as const;

export function isAdPathExcluded(pathname: string): boolean {
  return AD_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}
