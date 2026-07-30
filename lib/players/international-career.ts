import type { SeasonStats } from "@/types/domain";

const MAJOR_INTERNATIONAL_PATTERNS = [
  { key: "world_cup", label: "World Cup", pattern: /world cup/i },
  { key: "euro", label: "European Championship", pattern: /euro|european championship/i },
  { key: "afcon", label: "AFCON", pattern: /afcon|africa cup/i },
  { key: "copa", label: "Copa América", pattern: /copa america/i },
  { key: "nations", label: "Nations League", pattern: /nations league/i },
  { key: "olympics", label: "Olympics", pattern: /olymp/i },
] as const;

export interface InternationalCompetitionRow {
  label: string;
  appearances: number;
  goals: number;
  assists: number;
}

export interface InternationalCareerSummary {
  country: string;
  teamName: string | null;
  caps: number;
  goals: number;
  assists: number;
  minutes: number;
  majorCompetitions: InternationalCompetitionRow[];
  seasons: SeasonStats[];
}

function isInternationalSeason(season: SeasonStats): boolean {
  return season.team?.team_type === "national";
}

export function buildInternationalCareer(
  seasons: SeasonStats[],
  fallbackCountry: string,
): InternationalCareerSummary | null {
  const intlSeasons = seasons.filter(isInternationalSeason);
  if (intlSeasons.length === 0) {
    return null;
  }

  let caps = 0;
  let goals = 0;
  let assists = 0;
  let minutes = 0;
  const competitionTotals = new Map<
    string,
    { label: string; appearances: number; goals: number; assists: number }
  >();

  for (const season of intlSeasons) {
    caps += season.appearances;
    goals += season.goals;
    assists += season.assists;
    minutes += season.minutes;

    const matched = MAJOR_INTERNATIONAL_PATTERNS.find((item) =>
      item.pattern.test(season.competition),
    );
    const key = matched?.key ?? season.competition;
    const label = matched?.label ?? season.competition;
    const current = competitionTotals.get(key) ?? {
      label,
      appearances: 0,
      goals: 0,
      assists: 0,
    };
    current.appearances += season.appearances;
    current.goals += season.goals;
    current.assists += season.assists;
    competitionTotals.set(key, current);
  }

  const teamName = intlSeasons[0]?.team?.name ?? null;
  const country = intlSeasons[0]?.team?.country ?? fallbackCountry;

  return {
    country,
    teamName,
    caps,
    goals,
    assists,
    minutes,
    majorCompetitions: [...competitionTotals.values()].sort(
      (a, b) => b.goals - a.goals || b.appearances - a.appearances,
    ),
    seasons: [...intlSeasons].sort((a, b) => b.season.localeCompare(a.season)),
  };
}
