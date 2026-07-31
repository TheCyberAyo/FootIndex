export const SEARCH_SESSION_COOKIE_NAME = "footindex_search_session";
export const SEARCH_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function createSearchSessionId(): string {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    try {
      return cryptoApi.randomUUID();
    } catch {
      // randomUUID requires a secure context (HTTPS or localhost).
    }
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function isValidSearchSessionId(value: string | undefined | null): value is string {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  return trimmed.length >= 8 && trimmed.length <= 64;
}

export function getSearchSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SEARCH_SESSION_COOKIE_MAX_AGE,
  };
}
