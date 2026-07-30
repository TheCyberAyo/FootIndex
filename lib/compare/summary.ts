import type { CompareResult } from "@/lib/compare/types";
import type { PlayerProfile } from "@/types/domain";

/**
 * Deterministic comparison narrative from synced stats (non-AI v1 summary).
 */
export function buildComparisonSummary(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
  comparison: CompareResult,
): string {
  const nameOne = playerOne.player.short_name;
  const nameTwo = playerTwo.player.short_name;
  const { playerOneWins, playerTwoWins, ties } = comparison.scoreboard;

  const leader =
    playerOneWins > playerTwoWins
      ? nameOne
      : playerTwoWins > playerOneWins
        ? nameTwo
        : null;

  const parts: string[] = [];

  if (leader) {
    parts.push(
      `${leader} leads this head-to-head ${Math.max(playerOneWins, playerTwoWins)}–${Math.min(playerOneWins, playerTwoWins)} on career metrics we track (${ties} tied).`,
    );
  } else {
    parts.push(
      `${nameOne} and ${nameTwo} are level on our tracked career metrics (${ties} categories tied).`,
    );
  }

  const goalsOne = playerOne.career?.goals ?? 0;
  const goalsTwo = playerTwo.career?.goals ?? 0;
  if (goalsOne > 0 || goalsTwo > 0) {
    parts.push(
      `Career goals: ${nameOne} ${goalsOne}, ${nameTwo} ${goalsTwo}.`,
    );
  }

  const uclOne = playerOne.career?.champions_league_goals ?? 0;
  const uclTwo = playerTwo.career?.champions_league_goals ?? 0;
  if (uclOne > 0 || uclTwo > 0) {
    parts.push(
      `Champions League goals: ${nameOne} ${uclOne}, ${nameTwo} ${uclTwo}.`,
    );
  }

  const trophiesOne = playerOne.career?.trophies_count ?? playerOne.trophies.length;
  const trophiesTwo = playerTwo.career?.trophies_count ?? playerTwo.trophies.length;
  if (trophiesOne > 0 || trophiesTwo > 0) {
    parts.push(
      `Trophy count: ${nameOne} ${trophiesOne}, ${nameTwo} ${trophiesTwo}.`,
    );
  }

  parts.push(
    "Use season search below for a shareable year-by-year breakdown.",
  );

  return parts.join(" ");
}
