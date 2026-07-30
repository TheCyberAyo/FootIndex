import { localSeasonStats } from "@/lib/data/local-seed";
import { hasCuratedCareer } from "@/lib/players/curated";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import type { TeamType } from "@/types/database";

interface SeasonRollupRow {
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  competition: string;
  team: { team_type: TeamType } | { team_type: TeamType }[] | null;
}

function isChampionsLeague(competition: string): boolean {
  const normalized = competition.toLowerCase();
  return normalized.includes("champions league");
}

function isInternationalTeam(teamType: TeamType | undefined): boolean {
  return teamType === "national";
}

function aggregateSeasonRows(rows: SeasonRollupRow[]) {
  let appearances = 0;
  let goals = 0;
  let assists = 0;
  let minutes = 0;
  let clubGoals = 0;
  let internationalGoals = 0;
  let championsLeagueGoals = 0;

  for (const row of rows) {
    appearances += row.appearances;
    goals += row.goals;
    assists += row.assists;
    minutes += row.minutes;

    const team = Array.isArray(row.team) ? row.team[0] : row.team;
    const teamType = team?.team_type;

    if (isInternationalTeam(teamType)) {
      internationalGoals += row.goals;
    } else {
      clubGoals += row.goals;
    }

    if (isChampionsLeague(row.competition)) {
      championsLeagueGoals += row.goals;
    }
  }

  return {
    appearances,
    goals,
    assists,
    minutes,
    club_goals: clubGoals,
    international_goals: internationalGoals,
    champions_league_goals: championsLeagueGoals,
    trophies_count: 0,
    awards_count: 0,
  };
}

async function loadSeasonRollupRows(
  playerId: string,
): Promise<SeasonRollupRow[]> {
  if (!isSupabaseConfigured()) {
    return localSeasonStats
      .filter((row) => row.player_id === playerId)
      .map((row) => ({
        appearances: row.appearances,
        goals: row.goals,
        assists: row.assists,
        minutes: row.minutes,
        competition: row.competition,
        team: row.team
          ? { team_type: row.team.team_type }
          : { team_type: "club" as const },
      }));
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("season_stats")
    .select(
      "appearances, goals, assists, minutes, competition, team:teams(team_type)",
    )
    .eq("player_id", playerId);

  assertNoError(result.error, "Failed to load season stats for career rollup");
  return (result.data ?? []) as SeasonRollupRow[];
}

/**
 * Recompute career_stats from season_stats for non-curated players.
 * Curated Haaland/Mbappé baselines are never touched.
 */
export async function rollupCareerStatsForPlayer(
  playerId: string,
  slug: string,
): Promise<{ updated: boolean; goals: number }> {
  if (hasCuratedCareer(slug)) {
    return { updated: false, goals: 0 };
  }

  const rows = await loadSeasonRollupRows(playerId);
  if (rows.length === 0) {
    return { updated: false, goals: 0 };
  }

  const totals = aggregateSeasonRows(rows);

  if (!isSupabaseConfigured()) {
    return { updated: false, goals: totals.goals };
  }

  const supabase = createSupabaseAdminClient();
  const [trophyCount, awardCount] = await Promise.all([
    supabase
      .from("trophies")
      .select("id", { count: "exact", head: true })
      .eq("player_id", playerId),
    supabase
      .from("awards")
      .select("id", { count: "exact", head: true })
      .eq("player_id", playerId),
  ]);

  totals.trophies_count = trophyCount.count ?? 0;
  totals.awards_count = awardCount.count ?? 0;

  const upsert = await supabase.from("career_stats").upsert(
    {
      player_id: playerId,
      ...totals,
    },
    { onConflict: "player_id" },
  );

  assertNoError(upsert.error, "Failed to upsert rolled-up career stats");

  return { updated: true, goals: totals.goals };
}
