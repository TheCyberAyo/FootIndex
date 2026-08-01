export const CONSENT_STORAGE_KEY = "footindex_cookie_consent";
export const CONSENT_CHANGE_EVENT = "footindex:consent-change";

export type CookieConsentChoice = "accepted" | "declined";

export function getStoredConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (value === "accepted" || value === "declined") {
      return value;
    }
  } catch {
    // localStorage unavailable.
  }

  return null;
}

export function setStoredConsent(choice: CookieConsentChoice): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // localStorage unavailable.
  }

  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: choice }));
}

export function onConsentChange(
  listener: (choice: CookieConsentChoice | null) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) {
      listener(getStoredConsent());
    }
  };

  const handleCustom = (event: Event) => {
    const detail = (event as CustomEvent<CookieConsentChoice>).detail;
    listener(detail ?? getStoredConsent());
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CONSENT_CHANGE_EVENT, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CONSENT_CHANGE_EVENT, handleCustom);
  };
}
