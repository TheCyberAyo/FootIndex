const LEGACY_STORAGE_KEY = "footindex-search-session";
const MERGE_KEY_PREFIX = "footindex-search-merged";

let ensurePromise: Promise<void> | null = null;

export async function ensureSearchSession(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (ensurePromise) {
    return ensurePromise;
  }

  ensurePromise = (async () => {
    let legacySessionId: string | null = null;

    try {
      legacySessionId = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    } catch {
      // localStorage unavailable.
    }

    const response = await fetch("/api/search/session", {
      method: legacySessionId ? "POST" : "GET",
      credentials: "same-origin",
      ...(legacySessionId
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ legacySessionId }),
          }
        : {}),
    });

    if (legacySessionId && response.ok) {
      try {
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // Ignore cleanup failures.
      }
    }
  })();

  return ensurePromise;
}

export async function recordSearchClick(input: {
  searchTerm: string;
  playerId?: string;
}): Promise<void> {
  await ensureSearchSession();

  await fetch("/api/search/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      searchTerm: input.searchTerm,
      playerId: input.playerId,
    }),
  });
}

export async function recordSearchQuery(searchTerm: string): Promise<void> {
  const term = searchTerm.trim();
  if (term.length < 2) {
    return;
  }

  await ensureSearchSession();

  await fetch("/api/search/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ searchTerm: term }),
  });
}

export async function mergeSearchHistorySession(userId: string): Promise<void> {
  await ensureSearchSession();

  const mergeKey = `${MERGE_KEY_PREFIX}:${userId}`;
  try {
    if (sessionStorage.getItem(mergeKey)) {
      return;
    }
  } catch {
    // sessionStorage unavailable — still attempt merge once per call.
  }

  const response = await fetch("/api/search/history/merge", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    return;
  }

  try {
    sessionStorage.setItem(mergeKey, "1");
  } catch {
    // Ignore storage failures after a successful merge.
  }

  window.dispatchEvent(new Event("search-history-updated"));
}

export async function fetchRecentSearchTerms(limit = 5): Promise<string[]> {
  const entries = await fetchRecentSearches(limit);
  return entries.map((entry) => entry.searchTerm);
}

export interface RecentSearchEntry {
  id: string;
  searchTerm: string;
  playerSlug: string | null;
  playerName: string | null;
}

export async function fetchRecentSearches(
  limit = 6,
): Promise<RecentSearchEntry[]> {
  await ensureSearchSession();

  const params = new URLSearchParams({ limit: String(limit) });
  const response = await fetch(`/api/search/history?${params.toString()}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { entries?: RecentSearchEntry[] };
  return payload.entries ?? [];
}

export async function clearRecentSearches(): Promise<boolean> {
  await ensureSearchSession();

  const response = await fetch("/api/search/history", {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!response.ok) {
    return false;
  }

  window.dispatchEvent(new Event("search-history-updated"));
  return true;
}
