const STORAGE_KEY = "footindex-search-session";

function createSessionId(): string {
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

export function getSearchSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const created = createSessionId();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return createSessionId();
  }
}

export async function recordSearchClick(input: {
  searchTerm: string;
  playerId?: string;
}): Promise<void> {
  const sessionId = getSearchSessionId();
  if (!sessionId) {
    return;
  }

  await fetch("/api/search/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      searchTerm: input.searchTerm,
      playerId: input.playerId,
      sessionId,
    }),
  });
}

export async function fetchRecentSearchTerms(limit = 5): Promise<string[]> {
  const sessionId = getSearchSessionId();
  if (!sessionId) {
    return [];
  }

  const response = await fetch(
    `/api/search/history?sessionId=${encodeURIComponent(sessionId)}&limit=${limit}`,
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { terms?: string[] };
  return payload.terms ?? [];
}
