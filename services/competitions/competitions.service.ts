import { competitionSlugFromName } from "@/lib/competitions/paths";
import { localSeasonStats } from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import { listPlayers } from "@/services/players/players.service";
import type {
  CompetitionPlayerRow,
  CompetitionSummary,
  Player,
} from "@/types/domain";

interface SeasonCompetitionRow {
  player_id: string;
  competition: string;
  appearances: number;
  goals: number;
  assists: number;
}

async function listSeasonCompetitionRows(): Promise<SeasonCompetitionRow[]> {
  if (!isSupabaseConfigured()) {
    return localSeasonStats.map((row) => ({
      player_id: row.player_id,
      competition: row.competition,
      appearances: row.appearances,
      goals: row.goals,
      assists: row.assists,
    }));
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("season_stats")
    .select("player_id, competition, appearances, goals, assists");

  assertNoError(result.error, "Failed to load competition rows");
  return (result.data ?? []) as SeasonCompetitionRow[];
}

export async function listCompetitions(): Promise<CompetitionSummary[]> {
  const rows = await listSeasonCompetitionRows();
  const bySlug = new Map<string, string>();

  for (const row of rows) {
    const slug = competitionSlugFromName(row.competition);
    if (!bySlug.has(slug)) {
      bySlug.set(slug, row.competition);
    }
  }

  return [...bySlug.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCompetitionBySlug(
  slug: string,
): Promise<CompetitionSummary | null> {
  const competitions = await listCompetitions();
  return competitions.find((item) => item.slug === slug) ?? null;
}

export async function listCompetitionLeaderboard(
  slug: string,
): Promise<CompetitionPlayerRow[]> {
  const competition = await getCompetitionBySlug(slug);
  if (!competition) {
    return [];
  }

  const [rows, players] = await Promise.all([
    listSeasonCompetitionRows(),
    listPlayers(),
  ]);

  const playerMap = new Map<string, Player>(
    players.map((player) => [player.id, player]),
  );

  const totals = new Map<
    string,
    { appearances: number; goals: number; assists: number }
  >();

  for (const row of rows) {
    if (competitionSlugFromName(row.competition) !== slug) {
      continue;
    }

    const current = totals.get(row.player_id) ?? {
      appearances: 0,
      goals: 0,
      assists: 0,
    };

    totals.set(row.player_id, {
      appearances: current.appearances + row.appearances,
      goals: current.goals + row.goals,
      assists: current.assists + row.assists,
    });
  }

  return [...totals.entries()]
    .map(([playerId, stats]) => {
      const player = playerMap.get(playerId);
      if (!player) {
        return null;
      }
      return {
        player,
        ...stats,
      };
    })
    .filter((row): row is CompetitionPlayerRow => row !== null)
    .sort(
      (a, b) =>
        b.goals - a.goals ||
        b.assists - a.assists ||
        a.player.name.localeCompare(b.player.name),
    );
}
