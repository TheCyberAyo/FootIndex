const STORAGE_KEY = "footindex-search-session";

export function getSearchSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, created);
  return created;
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
