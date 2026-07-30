import type { Award, PlayerTransfer, SeasonStats, Trophy } from "@/types/domain";

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  subtitle: string;
  kind: "trophy" | "award" | "season" | "transfer";
}

/**
 * Build a career timeline from trophies, awards, and standout seasons.
 * Decision: derive from DB data — no hardcoded biography fiction.
 */
export function buildCareerTimeline(input: {
  trophies: Trophy[];
  awards: Award[];
  seasons: SeasonStats[];
  transfers?: PlayerTransfer[];
  limit?: number;
}): TimelineEvent[] {
  const limit = input.limit ?? 12;
  const events: TimelineEvent[] = [];

  (input.transfers ?? []).forEach((transfer) => {
    const year = Number(transfer.transferDate.slice(0, 4)) || 0;
    const from = transfer.fromTeam?.short_name ?? transfer.fromTeam?.name ?? "Previous club";
    const to = transfer.toTeam?.short_name ?? transfer.toTeam?.name ?? "New club";
    events.push({
      id: `transfer-${transfer.id}`,
      year,
      title: `${from} → ${to}`,
      subtitle: transfer.transferType
        ? `Transfer · ${transfer.transferType}`
        : "Transfer",
      kind: "transfer",
    });
  });

  input.trophies.forEach((trophy) => {
    events.push({
      id: `trophy-${trophy.id}`,
      year: trophy.year,
      title: trophy.name,
      subtitle: trophy.season
        ? `Trophy · ${trophy.season}`
        : `Trophy · ${trophy.year}`,
      kind: "trophy",
    });
  });

  input.awards.forEach((award) => {
    events.push({
      id: `award-${award.id}`,
      year: award.year,
      title: award.name,
      subtitle: award.competition
        ? `Award · ${award.competition}`
        : `Award · ${award.year}`,
      kind: "award",
    });
  });

  input.seasons
    .filter((season) => season.goals >= 15)
    .forEach((season) => {
      const year = Number(season.season.slice(0, 4)) || 0;
      events.push({
        id: `season-${season.id}`,
        year,
        title: `${season.goals} goals · ${season.competition}`,
        subtitle: `Season form · ${season.season}`,
        kind: "season",
      });
    });

  return events
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
    .slice(0, limit);
}
