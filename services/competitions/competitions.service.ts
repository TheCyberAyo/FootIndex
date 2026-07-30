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

interface CompetitionRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
}

async function listCompetitionCatalog(): Promise<CompetitionRow[]> {
  if (!isSupabaseConfigured()) {
    const names = new Set(localSeasonStats.map((row) => row.competition));
    return [...names].map((name) => ({
      id: competitionSlugFromName(name),
      slug: competitionSlugFromName(name),
      name,
      logo_url: null,
    }));
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("competitions")
    .select("id, slug, name, logo_url")
    .order("name", { ascending: true });

  if (!result.error && (result.data?.length ?? 0) > 0) {
    return result.data as CompetitionRow[];
  }

  const fallback = await supabase
    .from("season_stats")
    .select("competition")
    .limit(1000);

  assertNoError(fallback.error, "Failed to load competition rows");

  const bySlug = new Map<string, CompetitionRow>();
  for (const row of fallback.data ?? []) {
    const slug = competitionSlugFromName(row.competition);
    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        id: slug,
        slug,
        name: row.competition,
        logo_url: null,
      });
    }
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
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
  const catalog = await listCompetitionCatalog();
  return catalog.map((row) => ({
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
  }));
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
    const rowSlug = competitionSlugFromName(row.competition);
    if (rowSlug !== slug) {
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
