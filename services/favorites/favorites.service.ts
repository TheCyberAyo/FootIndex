import type { FavoriteEntityType } from "@/types/domain";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { comparePath } from "@/lib/compare/paths";
import { playerPath } from "@/lib/players/paths";
import { teamPath } from "@/lib/teams/paths";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canonicalComparePlayerIds } from "@/services/votes/comparison-votes.service";

export interface FavoriteItem {
  id: string;
  entityType: FavoriteEntityType;
  createdAt: string;
  label: string;
  href: string;
  meta?: string | null;
}

interface FavoriteQueryRow {
  id: string;
  entity_type: FavoriteEntityType;
  created_at: string;
  player_id: string | null;
  team_id: string | null;
  player_one_id: string | null;
  player_two_id: string | null;
  player:
    | { slug: string; name: string; short_name: string }
    | { slug: string; name: string; short_name: string }[]
    | null;
  team: { slug: string; name: string } | { slug: string; name: string }[] | null;
  comparison_player_one:
    | { slug: string; short_name: string }
    | { slug: string; short_name: string }[]
    | null;
  comparison_player_two:
    | { slug: string; short_name: string }
    | { slug: string; short_name: string }[]
    | null;
}

function mapRef<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapFavoriteRow(row: FavoriteQueryRow): FavoriteItem | null {
  if (row.entity_type === "player") {
    const player = mapRef(row.player);
    if (!player) {
      return null;
    }

    return {
      id: row.id,
      entityType: "player",
      createdAt: row.created_at,
      label: player.name,
      href: playerPath(player.slug),
      meta: player.short_name,
    };
  }

  if (row.entity_type === "team") {
    const team = mapRef(row.team);
    if (!team) {
      return null;
    }

    return {
      id: row.id,
      entityType: "team",
      createdAt: row.created_at,
      label: team.name,
      href: teamPath(team.slug),
    };
  }

  const playerOne = mapRef(row.comparison_player_one);
  const playerTwo = mapRef(row.comparison_player_two);
  if (!playerOne || !playerTwo) {
    return null;
  }

  return {
    id: row.id,
    entityType: "comparison",
    createdAt: row.created_at,
    label: `${playerOne.short_name} vs ${playerTwo.short_name}`,
    href: comparePath(playerOne.slug, playerTwo.slug),
    meta: "Comparison",
  };
}

export async function listUserFavorites(userId: string): Promise<FavoriteItem[]> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return [];
  }

  try {
    const supabase = createSupabaseAdminClient();
    const result = await supabase
      .from("user_favorites")
      .select(
        `
        id,
        entity_type,
        created_at,
        player_id,
        team_id,
        player_one_id,
        player_two_id,
        player:players!user_favorites_player_id_fkey ( slug, name, short_name ),
        team:teams!user_favorites_team_id_fkey ( slug, name ),
        comparison_player_one:players!user_favorites_player_one_id_fkey ( slug, short_name ),
        comparison_player_two:players!user_favorites_player_two_id_fkey ( slug, short_name )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (result.error || !result.data?.length) {
      return [];
    }

    return (result.data as unknown as FavoriteQueryRow[]).flatMap((row) => {
      const mapped = mapFavoriteRow(row);
      return mapped ? [mapped] : [];
    });
  } catch {
    return [];
  }
}

export async function isFavorite(input: {
  userId: string;
  entityType: FavoriteEntityType;
  playerId?: string;
  teamId?: string;
  playerOneId?: string;
  playerTwoId?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return false;
  }

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("user_favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", input.userId)
      .eq("entity_type", input.entityType);

    if (input.entityType === "player" && input.playerId) {
      query = query.eq("player_id", input.playerId);
    } else if (input.entityType === "team" && input.teamId) {
      query = query.eq("team_id", input.teamId);
    } else if (
      input.entityType === "comparison" &&
      input.playerOneId &&
      input.playerTwoId
    ) {
      const [playerOneId, playerTwoId] = canonicalComparePlayerIds(
        input.playerOneId,
        input.playerTwoId,
      );
      query = query
        .eq("player_one_id", playerOneId)
        .eq("player_two_id", playerTwoId);
    } else {
      return false;
    }

    const result = await query;
    return (result.count ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function addFavorite(input: {
  userId: string;
  entityType: FavoriteEntityType;
  playerId?: string;
  teamId?: string;
  playerOneId?: string;
  playerTwoId?: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  const payload = {
    user_id: input.userId,
    entity_type: input.entityType,
    player_id: null as string | null,
    team_id: null as string | null,
    player_one_id: null as string | null,
    player_two_id: null as string | null,
  };

  if (input.entityType === "player" && input.playerId) {
    payload.player_id = input.playerId;
  } else if (input.entityType === "team" && input.teamId) {
    payload.team_id = input.teamId;
  } else if (
    input.entityType === "comparison" &&
    input.playerOneId &&
    input.playerTwoId
  ) {
    const [playerOneId, playerTwoId] = canonicalComparePlayerIds(
      input.playerOneId,
      input.playerTwoId,
    );
    payload.player_one_id = playerOneId;
    payload.player_two_id = playerTwoId;
  } else {
    throw new Error("Invalid favorite payload");
  }

  const alreadyFavorite = await isFavorite(input);
  if (alreadyFavorite) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const result = await supabase.from("user_favorites").insert({
    user_id: payload.user_id,
    entity_type: payload.entity_type,
    player_id: payload.player_id,
    team_id: payload.team_id,
    player_one_id: payload.player_one_id,
    player_two_id: payload.player_two_id,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function removeFavorite(input: {
  userId: string;
  entityType: FavoriteEntityType;
  playerId?: string;
  teamId?: string;
  playerOneId?: string;
  playerTwoId?: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", input.userId)
    .eq("entity_type", input.entityType);

  if (input.entityType === "player" && input.playerId) {
    query = query.eq("player_id", input.playerId);
  } else if (input.entityType === "team" && input.teamId) {
    query = query.eq("team_id", input.teamId);
  } else if (
    input.entityType === "comparison" &&
    input.playerOneId &&
    input.playerTwoId
  ) {
    const [playerOneId, playerTwoId] = canonicalComparePlayerIds(
      input.playerOneId,
      input.playerTwoId,
    );
    query = query
      .eq("player_one_id", playerOneId)
      .eq("player_two_id", playerTwoId);
  } else {
    throw new Error("Invalid favorite payload");
  }

  const result = await query;
  if (result.error) {
    throw new Error(result.error.message);
  }
}
