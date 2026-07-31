import { getPlayerAge, formatStat } from "@/lib/players/format";
import {
  getRankingCategory,
  type RankingCategory,
} from "@/lib/rankings/categories";
import {
  playerMatchesRankingFilters,
  type RankingFilters,
} from "@/lib/rankings/filters";
import { localCareerStats } from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import { listPlayers } from "@/services/players/players.service";
import type { CareerStatRow, PlayerRow } from "@/types/database";
import type { CareerStats, Player, RankingEntry } from "@/types/domain";

interface PlayerWithTeam extends PlayerRow {
  current_team: Player["current_team"];
}

function formatRankingValue(categorySlug: string, value: number): string {
  if (categorySlug === "top-goal-contributions") {
    return formatStat(value);
  }
  return formatStat(value);
}

function resolveMetricValue(
  categorySlug: string,
  player: Player,
  career: CareerStats | null,
): number | null {
  if (!career) {
    return null;
  }

  switch (categorySlug) {
    case "top-scorers":
      return career.goals;
    case "top-assists":
      return career.assists;
    case "top-goal-contributions":
      return career.goals + career.assists;
    case "top-international-scorers":
      return career.international_goals;
    case "top-champions-league-scorers":
      return career.champions_league_goals;
    case "top-midfielders":
      return player.position === "MF" ? career.goals + career.assists : null;
    case "top-defenders":
      return player.position === "DF" ? career.appearances : null;
    case "top-goalkeepers":
      return player.position === "GK" ? career.appearances : null;
    case "top-young-players":
      return getPlayerAge(player.date_of_birth) < 23 ? career.goals : null;
    case "top-veterans":
      return getPlayerAge(player.date_of_birth) >= 30 ? career.goals : null;
    default:
      return null;
  }
}

async function listPlayersWithCareer(): Promise<
  Array<{ player: Player; career: CareerStats | null }>
> {
  if (!isSupabaseConfigured()) {
    const players = await listPlayers();
    return players.map((player) => ({
      player,
      career:
        localCareerStats.find((row) => row.player_id === player.id) ?? null,
    }));
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("players")
    .select("*, current_team:teams!players_current_team_id_fkey(*), career:career_stats(*)");

  assertNoError(result.error, "Failed to load ranking data");

  const rows = (result.data ?? []) as Array<
    PlayerWithTeam & { career: CareerStatRow | CareerStatRow[] | null }
  >;

  return rows.map((row) => {
    const careerRow = Array.isArray(row.career)
      ? (row.career[0] ?? null)
      : row.career;

    return {
      player: {
        id: row.id,
        slug: row.slug,
        name: row.name,
        short_name: row.short_name,
        date_of_birth: row.date_of_birth,
        nationality: row.nationality,
        height_cm: row.height_cm,
        position: row.position,
        preferred_foot: row.preferred_foot,
        bio: row.bio,
        image_url: row.image_url,
        current_team_id: row.current_team_id,
        api_football_id: row.api_football_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        current_team: Array.isArray(row.current_team)
          ? (row.current_team[0] ?? null)
          : row.current_team,
      },
      career: careerRow
        ? {
            ...careerRow,
            goals_per_game: Number(careerRow.goals_per_game),
          }
        : null,
    };
  });
}

async function getPlayerIdsMatchingSeasonFilters(
  filters: RankingFilters,
): Promise<Set<string> | null> {
  if (!filters.competition && !filters.season) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabasePublicClient();
  let query = supabase.from("season_stats").select("player_id");

  if (filters.competition) {
    query = query.ilike(
      "competition",
      `%${filters.competition.replace(/[%_]/g, "")}%`,
    );
  }

  if (filters.season) {
    query = query.eq("season", filters.season);
  }

  const result = await query;
  if (result.error) {
    return new Set();
  }

  return new Set(
    (result.data ?? [])
      .map((row) => row.player_id)
      .filter((playerId): playerId is string => Boolean(playerId)),
  );
}

export async function getRanking(
  categorySlug: string,
  filters?: RankingFilters,
): Promise<{ category: RankingCategory; entries: RankingEntry[] } | null> {
  const category = getRankingCategory(categorySlug);
  if (!category) {
    return null;
  }

  const seasonPlayerIds = await getPlayerIdsMatchingSeasonFilters(filters ?? {});

  const rows = await listPlayersWithCareer();
  const scored = rows
    .map(({ player, career }) => {
      if (!playerMatchesRankingFilters(player, filters)) {
        return null;
      }

      if (seasonPlayerIds && !seasonPlayerIds.has(player.id)) {
        return null;
      }

      const value = resolveMetricValue(categorySlug, player, career);
      if (value == null) {
        return null;
      }
      return {
        player,
        value,
        valueLabel: formatRankingValue(categorySlug, value),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.value - a.value || a.player.name.localeCompare(b.player.name));

  const entries: RankingEntry[] = scored.map((row, index) => ({
    rank: index + 1,
    player: row.player,
    value: row.value,
    valueLabel: row.valueLabel,
  }));

  return { category, entries };
}

export async function getTopScorersPreview(limit = 5): Promise<RankingEntry[]> {
  const result = await getRanking("top-scorers");
  return result?.entries.slice(0, limit) ?? [];
}
