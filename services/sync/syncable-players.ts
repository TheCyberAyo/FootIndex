import { API_FOOTBALL_PLAYERS } from "@/lib/api-football/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { assertNoError, ServiceError } from "@/services/errors";

export interface SyncablePlayer {
  id: string;
  slug: string;
  apiFootballId: number;
  teamApiId: number | null;
}

interface PlayerWithTeam {
  id: string;
  slug: string;
  api_football_id: number | null;
  current_team: { api_football_id: number | null } | { api_football_id: number | null }[] | null;
}

function teamApiIdForSlug(slug: string): number | null {
  const config = API_FOOTBALL_PLAYERS[slug as keyof typeof API_FOOTBALL_PLAYERS];
  return config?.teamApiId ?? null;
}

function resolveTeamApiId(player: PlayerWithTeam): number | null {
  const team = player.current_team;
  const relation = Array.isArray(team) ? team[0] : team;
  return relation?.api_football_id ?? teamApiIdForSlug(player.slug);
}

/**
 * Players eligible for API-Football sync — database-driven, not hardcoded slugs.
 */
export async function listSyncablePlayers(): Promise<SyncablePlayer[]> {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("players")
    .select(
      "id, slug, api_football_id, current_team:teams!players_current_team_id_fkey(api_football_id)",
    )
    .not("api_football_id", "is", null)
    .order("slug", { ascending: true });

  assertNoError(result.error, "Failed to list syncable players");

  return ((result.data ?? []) as PlayerWithTeam[])
    .filter((row): row is PlayerWithTeam & { api_football_id: number } =>
      row.api_football_id != null,
    )
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      apiFootballId: row.api_football_id,
      teamApiId: resolveTeamApiId(row),
    }));
}

export async function getSyncablePlayerBySlug(
  slug: string,
): Promise<SyncablePlayer | null> {
  const players = await listSyncablePlayers();
  return players.find((player) => player.slug === slug) ?? null;
}

export function requireSyncablePlayer(
  player: SyncablePlayer | null,
  slug: string,
): SyncablePlayer {
  if (!player) {
    throw new ServiceError(
      `Player "${slug}" is missing or has no api_football_id. Seed the row first.`,
      "PLAYER_NOT_SYNCABLE",
    );
  }
  return player;
}
