import { describe, expect, it } from "vitest";

import {
  buildComparison,
  buildScoreboard,
  formatCompareValue,
} from "@/lib/compare/engine";
import type { PlayerProfile } from "@/types/domain";

function profile(
  slug: string,
  career: PlayerProfile["career"],
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
    career,
    seasons: [],
    awards: [],
    trophies: [],
    transfers: [],
  };
}

describe("compare engine", () => {
  it("formats missing values as em dash", () => {
    expect(formatCompareValue(null, "integer")).toBe("—");
  });

  it("does not treat missing career stats as zero", () => {
    const ready = profile("haaland", {
      id: "career-haaland",
      player_id: "haaland",
      goals: 200,
      assists: 40,
      appearances: 300,
      minutes: 24000,
      goals_per_game: 0.67,
      club_goals: 180,
      international_goals: 20,
      champions_league_goals: 50,
      trophies_count: 10,
      awards_count: 5,
      created_at: "",
      updated_at: "",
    });
    const unsynced = profile("bench-player", null);

    const comparison = buildComparison(ready, unsynced);
    const goals = comparison.metrics.find((metric) => metric.key === "goals");

    expect(goals?.playerOneValue).toBe(200);
    expect(goals?.playerTwoValue).toBeNull();
    expect(comparison.scoreboard.playerOneWins).toBe(0);
    expect(comparison.scoreboard.playerTwoWins).toBe(0);
  });

  it("excludes unavailable metrics from the scoreboard", () => {
    const scoreboard = buildScoreboard([
      {
        key: "goals",
        label: "Goals",
        format: "integer",
        playerOneValue: 10,
        playerTwoValue: null,
        winner: "tie",
        delta: null,
      },
      {
        key: "assists",
        label: "Assists",
        format: "integer",
        playerOneValue: 5,
        playerTwoValue: 2,
        winner: "playerOne",
        delta: 3,
      },
    ]);

    expect(scoreboard).toEqual({
      playerOneWins: 1,
      playerTwoWins: 0,
      ties: 0,
    });
  });
});
