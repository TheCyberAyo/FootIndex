import { describe, expect, it } from "vitest";

describe("most searched aggregation", () => {
  it("groups player ids by count and sorts descending", () => {
    const rows = [
      { player_id: "a" },
      { player_id: "b" },
      { player_id: "a" },
      { player_id: "c" },
      { player_id: "a" },
      { player_id: "b" },
    ];

    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.player_id, (counts.get(row.player_id) ?? 0) + 1);
    }

    const ranked = [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 3)
      .map(([playerId, searchCount]) => ({ playerId, searchCount }));

    expect(ranked).toEqual([
      { playerId: "a", searchCount: 3 },
      { playerId: "b", searchCount: 2 },
      { playerId: "c", searchCount: 1 },
    ]);
  });
});
