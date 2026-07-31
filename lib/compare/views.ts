import { ensureSearchSession } from "@/lib/search/session";

const MERGE_KEY_PREFIX = "footindex-comparison-views-merged";

export async function recordComparisonView(
  playerOneId: string,
  playerTwoId: string,
): Promise<void> {
  await ensureSearchSession();

  await fetch("/api/compare/views", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerOneId, playerTwoId }),
    credentials: "same-origin",
  });
}

export async function mergeComparisonViewsSession(userId: string): Promise<void> {
  await ensureSearchSession();

  const mergeKey = `${MERGE_KEY_PREFIX}:${userId}`;
  try {
    if (sessionStorage.getItem(mergeKey)) {
      return;
    }
  } catch {
    // sessionStorage unavailable.
  }

  const response = await fetch("/api/compare/views/merge", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    return;
  }

  try {
    sessionStorage.setItem(mergeKey, "1");
  } catch {
    // Ignore storage failures after merge.
  }
}
