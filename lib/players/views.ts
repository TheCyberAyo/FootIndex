import { ensureSearchSession } from "@/lib/search/session";

export interface RecentlyViewedPlayerEntry {
  viewId: string;
  viewedAt: string;
  id: string;
  slug: string;
  name: string;
  shortName: string;
  imageUrl: string | null;
  clubName: string | null;
  href: string;
}

const MERGE_KEY_PREFIX = "footindex-player-views-merged";

export async function recordPlayerView(playerId: string): Promise<void> {
  await ensureSearchSession();

  await fetch("/api/players/views", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ playerId }),
  });

  window.dispatchEvent(new Event("player-views-updated"));
}

export async function mergePlayerViewsSession(userId: string): Promise<void> {
  await ensureSearchSession();

  const mergeKey = `${MERGE_KEY_PREFIX}:${userId}`;
  try {
    if (sessionStorage.getItem(mergeKey)) {
      return;
    }
  } catch {
    // sessionStorage unavailable — still attempt merge once per call.
  }

  const response = await fetch("/api/players/views/merge", {
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

  window.dispatchEvent(new Event("player-views-updated"));
}

export async function fetchRecentlyViewedPlayers(input: {
  limit?: number;
  excludeSlug?: string;
} = {}): Promise<RecentlyViewedPlayerEntry[]> {
  await ensureSearchSession();

  const params = new URLSearchParams({
    limit: String(input.limit ?? 6),
  });

  if (input.excludeSlug) {
    params.set("excludeSlug", input.excludeSlug);
  }

  const response = await fetch(`/api/players/views?${params.toString()}`, {
    credentials: "same-origin",
  });
  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    players?: RecentlyViewedPlayerEntry[];
  };
  return payload.players ?? [];
}

export async function clearRecentlyViewedPlayers(): Promise<boolean> {
  await ensureSearchSession();

  const response = await fetch("/api/players/views", {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!response.ok) {
    return false;
  }

  window.dispatchEvent(new Event("player-views-updated"));
  return true;
}
