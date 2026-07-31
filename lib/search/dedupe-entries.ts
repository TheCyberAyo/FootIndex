export interface DedupeSearchEntry {
  id: string;
  searchTerm: string;
}

export function dedupeSearchHistoryEntries<T extends DedupeSearchEntry>(
  entries: T[],
  limit?: number,
): T[] {
  const seen = new Set<string>();
  const deduped: T[] = [];

  for (const entry of entries) {
    const key = entry.searchTerm.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(entry);
  }

  if (limit == null) {
    return deduped;
  }

  return deduped.slice(0, Math.max(1, limit));
}

export const SEARCH_HISTORY_DEDUPE_WINDOW_MS = 5 * 60 * 1000;

export function isWithinDedupeWindow(
  createdAt: string,
  now = Date.now(),
  windowMs = SEARCH_HISTORY_DEDUPE_WINDOW_MS,
): boolean {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) {
    return false;
  }

  return now - created <= windowMs;
}
