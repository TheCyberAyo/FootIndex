import type { SeasonStats, Team, Trophy } from "@/types/domain";

export interface ClubHistoryEntry {
  team: Team;
  seasons: string[];
  yearsLabel: string;
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  trophiesWon: number;
}

function isClubSeason(season: SeasonStats): boolean {
  if (!season.team) {
    return true;
  }
  return season.team.team_type === "club";
}

function seasonStartYear(label: string): number {
  const match = label.match(/^(\d{4})/);
  return match ? Number(match[1]) : 0;
}

export function buildClubHistory(
  seasons: SeasonStats[],
  trophies: Trophy[],
): ClubHistoryEntry[] {
  const clubSeasons = seasons.filter(isClubSeason);
  const byTeam = new Map<string, ClubHistoryEntry>();

  for (const season of clubSeasons) {
    const team = season.team;
    if (!team) {
      continue;
    }

    const existing = byTeam.get(team.id) ?? {
      team,
      seasons: [],
      yearsLabel: "",
      appearances: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
      trophiesWon: 0,
    };

    if (!existing.seasons.includes(season.season)) {
      existing.seasons.push(season.season);
    }

    existing.appearances += season.appearances;
    existing.goals += season.goals;
    existing.assists += season.assists;
    existing.minutes += season.minutes;
    byTeam.set(team.id, existing);
  }

  for (const trophy of trophies) {
    if (!trophy.team_id) {
      continue;
    }
    const entry = byTeam.get(trophy.team_id);
    if (entry) {
      entry.trophiesWon += 1;
    }
  }

  return [...byTeam.values()]
    .map((entry) => {
      const years = entry.seasons
        .map(seasonStartYear)
        .filter((year) => year > 0)
        .sort((a, b) => a - b);
      const yearsLabel =
        years.length >= 2
          ? `${years[0]}–${years[years.length - 1]}`
          : years.length === 1
            ? String(years[0])
            : entry.seasons[0] ?? "—";

      return {
        ...entry,
        seasons: [...entry.seasons].sort((a, b) => b.localeCompare(a)),
        yearsLabel,
      };
    })
    .sort(
      (a, b) =>
        seasonStartYear(b.seasons[0] ?? "") -
          seasonStartYear(a.seasons[0] ?? "") ||
        b.goals - a.goals,
    );
}
