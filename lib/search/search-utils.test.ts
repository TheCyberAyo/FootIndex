import { describe, expect, it } from "vitest";

import {
  dedupeSearchHistoryEntries,
  isWithinDedupeWindow,
  SEARCH_HISTORY_DEDUPE_WINDOW_MS,
} from "@/lib/search/dedupe-entries";
import { parseSearchFilters } from "@/lib/search/filters";

describe("dedupeSearchHistoryEntries", () => {
  it("removes duplicate terms case-insensitively", () => {
    const deduped = dedupeSearchHistoryEntries([
      { id: "1", searchTerm: "Haaland" },
      { id: "2", searchTerm: "haaland" },
      { id: "3", searchTerm: "Salah" },
    ]);

    expect(deduped).toHaveLength(2);
    expect(deduped.map((entry) => entry.searchTerm)).toEqual(["Haaland", "Salah"]);
  });

  it("respects the limit", () => {
    const deduped = dedupeSearchHistoryEntries(
      [
        { id: "1", searchTerm: "A" },
        { id: "2", searchTerm: "B" },
        { id: "3", searchTerm: "C" },
      ],
      2,
    );

    expect(deduped).toHaveLength(2);
  });
});

describe("isWithinDedupeWindow", () => {
  it("returns true inside the dedupe window", () => {
    const now = Date.now();
    const createdAt = new Date(now - 60_000).toISOString();

    expect(
      isWithinDedupeWindow(createdAt, now, SEARCH_HISTORY_DEDUPE_WINDOW_MS),
    ).toBe(true);
  });

  it("returns false outside the dedupe window", () => {
    const now = Date.now();
    const createdAt = new Date(now - SEARCH_HISTORY_DEDUPE_WINDOW_MS - 1).toISOString();

    expect(
      isWithinDedupeWindow(createdAt, now, SEARCH_HISTORY_DEDUPE_WINDOW_MS),
    ).toBe(false);
  });
});

describe("parseSearchFilters", () => {
  it("parses valid filter params", () => {
    expect(
      parseSearchFilters({
        position: "fw",
        nationality: " Norway ",
        club: "City",
      }),
    ).toEqual({
      position: "FW",
      nationality: "Norway",
      club: "City",
    });
  });

  it("ignores invalid or short values", () => {
    expect(
      parseSearchFilters({
        position: "ST",
        nationality: "N",
        club: " ",
      }),
    ).toEqual({});
  });
});
