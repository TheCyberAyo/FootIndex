import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { getPlayerAge, formatPosition } from "@/lib/players/format";
import { playerPath } from "@/lib/players/paths";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { PlayerSearchResult } from "@/types/domain";

export interface RecentlyViewedPlayer {
  viewId: string;
  viewedAt: string;
  id: string;
  slug: string;
  name: string;
  shortName: string;
  age: number;
  nationality: string;
  position: PlayerSearchResult["position"];
  positionLabel: string;
  imageUrl: string | null;
  clubName: string | null;
  clubLogoUrl: string | null;
  href: string;
}

interface PlayerViewRow {
  id: string;
  viewed_at: string;
  player:
    | {
        id: string;
        slug: string;
        name: string;
        short_name: string;
        date_of_birth: string;
        nationality: string;
        position: PlayerSearchResult["position"];
        image_url: string | null;
        current_team:
          | { name: string; logo_url: string | null }
          | { name: string; logo_url: string | null }[]
          | null;
      }
    | {
        id: string;
        slug: string;
        name: string;
        short_name: string;
        date_of_birth: string;
        nationality: string;
        position: PlayerSearchResult["position"];
        image_url: string | null;
        current_team:
          | { name: string; logo_url: string | null }
          | { name: string; logo_url: string | null }[]
          | null;
      }[]
    | null;
}

function mapPlayerViewRow(row: PlayerViewRow): RecentlyViewedPlayer | null {
  const player = Array.isArray(row.player) ? row.player[0] : row.player;
  if (!player) {
    return null;
  }

  const team = Array.isArray(player.current_team)
    ? player.current_team[0]
    : player.current_team;

  return {
    viewId: row.id,
    viewedAt: row.viewed_at,
    id: player.id,
    slug: player.slug,
    name: player.name,
    shortName: player.short_name,
    age: getPlayerAge(player.date_of_birth),
    nationality: player.nationality,
    position: player.position,
    positionLabel: formatPosition(player.position),
    imageUrl: player.image_url,
    clubName: team?.name ?? null,
    clubLogoUrl: team?.logo_url ?? null,
    href: playerPath(player.slug),
  };
}

export async function recordPlayerView(input: {
  playerId: string;
  userId?: string | null;
  sessionId?: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();

    if (input.sessionId) {
      await supabase
        .from("player_views")
        .delete()
        .eq("session_id", input.sessionId)
        .eq("player_id", input.playerId);
    }

    if (input.userId) {
      await supabase
        .from("player_views")
        .delete()
        .eq("user_id", input.userId)
        .eq("player_id", input.playerId);
    }

    await supabase.from("player_views").insert({
      player_id: input.playerId,
      user_id: input.userId ?? null,
      session_id: input.sessionId ?? null,
    });
  } catch {
    // Views table optional until migration is applied.
  }
}

export async function listRecentlyViewedPlayers(input: {
  userId?: string | null;
  sessionId?: string | null;
  limit?: number;
  excludeSlug?: string | null;
}): Promise<RecentlyViewedPlayer[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const limit = Math.max(1, Math.min(input.limit ?? 8, 20));

  try {
    const supabase =
      (input.sessionId || input.userId) && isSupabaseAdminConfigured()
        ? createSupabaseAdminClient()
        : createSupabasePublicClient();

    let query = supabase
      .from("player_views")
      .select(
        "id, viewed_at, player:players!player_views_player_id_fkey(id, slug, name, short_name, date_of_birth, nationality, position, image_url, current_team:teams!players_current_team_id_fkey(name, logo_url))",
      )
      .order("viewed_at", { ascending: false })
      .limit(limit * 3);

    if (input.userId) {
      query = query.eq("user_id", input.userId);
    } else if (input.sessionId) {
      query = query.eq("session_id", input.sessionId);
    } else {
      return [];
    }

    const result = await query;
    if (result.error) {
      return [];
    }

    const seen = new Set<string>();
    const players: RecentlyViewedPlayer[] = [];

    for (const row of (result.data ?? []) as PlayerViewRow[]) {
      const mapped = mapPlayerViewRow(row);
      if (!mapped) {
        continue;
      }

      if (input.excludeSlug && mapped.slug === input.excludeSlug) {
        continue;
      }

      if (seen.has(mapped.id)) {
        continue;
      }

      seen.add(mapped.id);
      players.push(mapped);

      if (players.length >= limit) {
        break;
      }
    }

    return players;
  } catch {
    return [];
  }
}

export async function mergeSessionPlayerViews(input: {
  sessionId: string;
  userId: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("player_views")
      .update({ user_id: input.userId, session_id: null })
      .eq("session_id", input.sessionId)
      .is("user_id", null);
  } catch {
    // Views table optional until migration is applied.
  }
}

export async function clearPlayerViews(input: {
  userId?: string | null;
  sessionId?: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  if (!input.userId && !input.sessionId) {
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();

    if (input.userId) {
      await supabase.from("player_views").delete().eq("user_id", input.userId);
      return;
    }

    if (input.sessionId) {
      await supabase.from("player_views").delete().eq("session_id", input.sessionId);
    }
  } catch {
    // Views table optional until migration is applied.
  }
}
