import { getPlayerAge } from "@/lib/players/format";
import type { CareerStats, Player, SeasonStats } from "@/types/domain";

export interface PlayerRecord {
  id: string;
  label: string;
  value: string;
  detail: string;
}

function bestSeasonBy(
  seasons: SeasonStats[],
  metric: "goals" | "assists" | "appearances",
): SeasonStats | null {
  if (seasons.length === 0) {
    return null;
  }

  return seasons.reduce((best, row) =>
    row[metric] > best[metric] ? row : best,
  );
}

function bestRateSeason(seasons: SeasonStats[]): SeasonStats | null {
  const eligible = seasons.filter((row) => row.appearances >= 10);
  if (eligible.length === 0) {
    return null;
  }

  return eligible.reduce((best, row) => {
    const rate = row.goals / row.appearances;
    const bestRate = best.goals / best.appearances;
    return rate > bestRate ? row : best;
  });
}

/**
 * Personal bests derived only from synced season/career rows (spec §65).
 */
export function buildPlayerRecords(input: {
  player: Player;
  career: CareerStats | null;
  seasons: SeasonStats[];
}): PlayerRecord[] {
  const records: PlayerRecord[] = [];
  const { player, career, seasons } = input;

  if (seasons.length === 0 && !career) {
    return records;
  }

  const bestGoals = bestSeasonBy(seasons, "goals");
  if (bestGoals && bestGoals.goals > 0) {
    records.push({
      id: "best-season-goals",
      label: "Most goals in a season",
      value: String(bestGoals.goals),
      detail: `${bestGoals.competition} · ${bestGoals.season}${
        bestGoals.team?.short_name ? ` · ${bestGoals.team.short_name}` : ""
      }`,
    });
  }

  const bestAssists = bestSeasonBy(seasons, "assists");
  if (bestAssists && bestAssists.assists > 0) {
    records.push({
      id: "best-season-assists",
      label: "Most assists in a season",
      value: String(bestAssists.assists),
      detail: `${bestAssists.competition} · ${bestAssists.season}`,
    });
  }

  const bestApps = bestSeasonBy(seasons, "appearances");
  if (bestApps && bestApps.appearances > 0) {
    records.push({
      id: "best-season-apps",
      label: "Most appearances in a season",
      value: String(bestApps.appearances),
      detail: `${bestApps.competition} · ${bestApps.season}`,
    });
  }

  const bestRate = bestRateSeason(seasons);
  if (bestRate && bestRate.goals > 0) {
    records.push({
      id: "best-season-rate",
      label: "Best goals per game (10+ apps)",
      value: (bestRate.goals / bestRate.appearances).toFixed(2),
      detail: `${bestRate.goals} in ${bestRate.appearances} · ${bestRate.season}`,
    });
  }

  if (career && career.goals > 0) {
    records.push({
      id: "career-goals",
      label: "Career goals",
      value: String(career.goals),
      detail: `${career.appearances} appearances · ${Number(career.goals_per_game).toFixed(2)} per game`,
    });
  }

  if (career && career.champions_league_goals > 0) {
    records.push({
      id: "ucl-goals",
      label: "Champions League goals",
      value: String(career.champions_league_goals),
      detail: "Aggregated from synced European competition rows",
    });
  }

  const age = getPlayerAge(player.date_of_birth);
  if (age > 0 && age <= 23 && career && career.goals >= 20) {
    records.push({
      id: "young-scorer",
      label: "Early-career scoring",
      value: `${career.goals} goals`,
      detail: `Age ${age} · ${career.appearances} apps in our synced dataset`,
    });
  }

  return records;
}
