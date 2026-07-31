import { competitionSlugFromName } from "@/lib/competitions/paths";
import { localSeasonStats, localTeams } from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { teamPath } from "@/lib/teams/paths";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import { getCompetitionBySlug } from "@/services/competitions/competitions.service";

export interface CompetitionStandingRow {
  rank: number;
  teamId: string;
  teamName: string;
  teamSlug: string;
  logoUrl: string | null;
  goals: number;
  assists: number;
  appearances: number;
  players: number;
  href: string;
}

interface SeasonStatAggregateRow {
  team_id: string | null;
  goals: number;
  assists: number;
  appearances: number;
  player_id: string;
  competition: string;
}

interface TeamSummaryRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

function aggregateStandings(
  rows: SeasonStatAggregateRow[],
  teamsById: Map<string, TeamSummaryRow>,
): CompetitionStandingRow[] {
  const byTeam = new Map<
    string,
    {
      goals: number;
      assists: number;
      appearances: number;
      players: Set<string>;
      team: TeamSummaryRow;
    }
  >();

  for (const row of rows) {
    if (!row.team_id) {
      continue;
    }

    const team = teamsById.get(row.team_id);
    if (!team) {
      continue;
    }

    const bucket = byTeam.get(row.team_id) ?? {
      goals: 0,
      assists: 0,
      appearances: 0,
      players: new Set<string>(),
      team,
    };

    bucket.goals += row.goals;
    bucket.assists += row.assists;
    bucket.appearances += row.appearances;
    bucket.players.add(row.player_id);
    byTeam.set(row.team_id, bucket);
  }

  return [...byTeam.values()]
    .sort(
      (left, right) =>
        right.goals - left.goals ||
        right.assists - left.assists ||
        left.team.name.localeCompare(right.team.name),
    )
    .map((entry, index) => ({
      rank: index + 1,
      teamId: entry.team.id,
      teamName: entry.team.name,
      teamSlug: entry.team.slug,
      logoUrl: entry.team.logo_url,
      goals: entry.goals,
      assists: entry.assists,
      appearances: entry.appearances,
      players: entry.players.size,
      href: teamPath(entry.team.slug),
    }));
}

export async function listCompetitionStandings(
  competitionSlug: string,
): Promise<CompetitionStandingRow[]> {
  const competition = await getCompetitionBySlug(competitionSlug);
  if (!competition) {
    return [];
  }

  if (!isSupabaseConfigured()) {
    const rows = localSeasonStats
      .filter(
        (row) => competitionSlugFromName(row.competition) === competitionSlug,
      )
      .map((row) => ({
        team_id: row.team_id ?? null,
        goals: row.goals,
        assists: row.assists,
        appearances: row.appearances,
        player_id: row.player_id,
        competition: row.competition,
      }));

    const teamsById = new Map(
      localTeams.map((team) => [
        team.id,
        {
          id: team.id,
          name: team.name,
          slug: team.slug,
          logo_url: team.logo_url,
        },
      ]),
    );

    return aggregateStandings(rows, teamsById);
  }

  const supabase = createSupabasePublicClient();
  const statsResult = await supabase
    .from("season_stats")
    .select("team_id, goals, assists, appearances, player_id, competition")
    .eq("competition", competition.name)
    .limit(5000);

  assertNoError(statsResult.error, "Failed to load competition standings");

  const rows = (statsResult.data ?? []) as SeasonStatAggregateRow[];
  const teamIds = [
    ...new Set(
      rows.map((row) => row.team_id).filter((teamId): teamId is string => Boolean(teamId)),
    ),
  ];

  if (teamIds.length === 0) {
    return [];
  }

  const teamsResult = await supabase
    .from("teams")
    .select("id, name, slug, logo_url")
    .in("id", teamIds);

  assertNoError(teamsResult.error, "Failed to load teams for standings");

  const teamsById = new Map(
    ((teamsResult.data ?? []) as TeamSummaryRow[]).map((team) => [team.id, team]),
  );

  return aggregateStandings(rows, teamsById);
}
