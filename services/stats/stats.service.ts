import { localCareerStats, localSeasonStats } from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import type { CareerStatRow, SeasonStatRow, TeamRow } from "@/types/database";
import type { CareerStats, SeasonStats } from "@/types/domain";

interface SeasonWithTeam extends SeasonStatRow {
  team: TeamRow | TeamRow[] | null;
}

export async function getCareerStatsByPlayerId(
  playerId: string,
): Promise<CareerStats | null> {
  if (!isSupabaseConfigured()) {
    return localCareerStats.find((item) => item.player_id === playerId) ?? null;
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("career_stats")
    .select("*")
    .eq("player_id", playerId)
    .maybeSingle();

  assertNoError(result.error, "Failed to load career stats");

  if (!result.data) {
    return null;
  }

  const career = result.data as CareerStatRow;

  return {
    ...career,
    goals_per_game: Number(career.goals_per_game),
  };
}

export async function listSeasonStatsByPlayerId(
  playerId: string,
): Promise<SeasonStats[]> {
  if (!isSupabaseConfigured()) {
    return localSeasonStats.filter((item) => item.player_id === playerId);
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("season_stats")
    .select("*, team:teams(*)")
    .eq("player_id", playerId)
    .order("season", { ascending: false });

  assertNoError(result.error, "Failed to load season stats");

  const seasons = (result.data ?? []) as SeasonWithTeam[];

  return seasons.map((season) => ({
    ...season,
    team: Array.isArray(season.team)
      ? (season.team[0] ?? null)
      : (season.team ?? null),
  }));
}
