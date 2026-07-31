import { describe, expect, it } from "vitest";

import { applySearchFilters } from "@/lib/search/apply-filters";
import type { PlayerSearchResult } from "@/types/domain";

const sampleResults: PlayerSearchResult[] = [
  {
    id: "1",
    slug: "erling-haaland",
    name: "Erling Haaland",
    shortName: "Haaland",
    age: 25,
    nationality: "Norway",
    position: "FW",
    positionLabel: "Forward",
    imageUrl: null,
    clubName: "Manchester City",
    clubLogoUrl: null,
    competition: "Premier League",
    href: "/player/erling-haaland",
  },
  {
    id: "2",
    slug: "kevin-de-bruyne",
    name: "Kevin De Bruyne",
    shortName: "De Bruyne",
    age: 33,
    nationality: "Belgium",
    position: "MF",
    positionLabel: "Midfielder",
    imageUrl: null,
    clubName: "Manchester City",
    clubLogoUrl: null,
    competition: "Premier League",
    href: "/player/kevin-de-bruyne",
  },
];

describe("applySearchFilters", () => {
  it("returns all results when no filters are set", () => {
    expect(applySearchFilters(sampleResults)).toHaveLength(2);
  });

  it("filters by position", () => {
    const filtered = applySearchFilters(sampleResults, { position: "FW" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe("erling-haaland");
  });

  it("filters by nationality substring", () => {
    const filtered = applySearchFilters(sampleResults, { nationality: "bel" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe("kevin-de-bruyne");
  });

  it("filters by club substring", () => {
    const filtered = applySearchFilters(sampleResults, { club: "city" });
    expect(filtered).toHaveLength(2);
  });

  it("combines multiple filters", () => {
    const filtered = applySearchFilters(sampleResults, {
      position: "MF",
      club: "city",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe("kevin-de-bruyne");
  });

  it("filters by competition and age range", () => {
    const filtered = applySearchFilters(sampleResults, {
      competition: "premier",
      ageMin: 30,
      ageMax: 34,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe("kevin-de-bruyne");
  });
});
