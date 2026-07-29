/**
 * Client-safe auth redirect helpers (no next/headers).
 */

export function authRedirectUrl(nextPath = "/compare#vote"): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;
}
