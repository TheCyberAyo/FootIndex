import { describe, expect, it } from "vitest";

import {
  assessComparePair,
  getCompareDataTier,
  isComparePairReady,
  isComparePickerEligible,
  isCompareReady,
} from "@/lib/compare/readiness";
import type { PlayerProfile } from "@/types/domain";

function profile(
  slug: string,
  options: {
    career?: PlayerProfile["career"];
    seasons?: PlayerProfile["seasons"];
  } = {},
): PlayerProfile {
  return {
    player: {
      id: slug,
      slug,
      name: slug,
      short_name: slug,
      date_of_birth: "1995-01-01",
      nationality: "Test",
      height_cm: 180,
      position: "FW",
      bio: "",
      image_url: null,
      api_football_id: null,
      current_team_id: null,
      preferred_foot: null,
      created_at: "",
      updated_at: "",
    },
    career: options.career ?? null,
    seasons: options.seasons ?? [],
    awards: [],
    trophies: [],
    transfers: [],
  };
}

describe("compare readiness", () => {
  it("treats curated slugs as ready", () => {
    const haaland = profile("haaland");
    expect(getCompareDataTier(haaland)).toBe("curated");
    expect(isCompareReady(haaland)).toBe(true);
  });

  it("requires two synced seasons for rolled-up careers", () => {
    const partial = profile("mohamed-salah", {
      career: {
        id: "career-mohamed-salah",
        player_id: "mohamed-salah",
        goals: 20,
        assists: 5,
        appearances: 30,
        minutes: 2500,
        goals_per_game: 0.67,
        club_goals: 18,
        international_goals: 2,
        champions_league_goals: 4,
        trophies_count: 0,
        awards_count: 0,
        created_at: "",
        updated_at: "",
      },
      seasons: [
        {
          id: "1",
          player_id: "mohamed-salah",
          season: "2024-2025",
          competition: "Premier League",
          appearances: 30,
          goals: 20,
          assists: 5,
          minutes: 2500,
          yellow_cards: 0,
          red_cards: 0,
          competition_id: null,
          team_id: null,
          season_id: null,
          created_at: "",
          updated_at: "",
        },
      ],
    });

    expect(getCompareDataTier(partial)).toBe("partial");
    expect(isCompareReady(partial)).toBe(false);
  });

  it("marks pairs ready only when both players qualify", () => {
    const haaland = profile("haaland");
    const mbappe = profile("mbappe");
    const unsynced = profile("random-player");

    expect(isComparePairReady(haaland, mbappe)).toBe(true);
    expect(assessComparePair(haaland, unsynced).pairReady).toBe(false);
  });

  it("limits picker eligibility to the marquee catalog", () => {
    expect(isComparePickerEligible("haaland")).toBe(true);
    expect(isComparePickerEligible("lionel-messi")).toBe(true);
    expect(isComparePickerEligible("random-player")).toBe(false);
  });
});
