import { localTeams } from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import { listPlayers } from "@/services/players/players.service";
import type { TeamRow } from "@/types/database";
import type { Player, Team } from "@/types/domain";

export async function listTeams(): Promise<Team[]> {
  if (!isSupabaseConfigured()) {
    return localTeams;
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });

  assertNoError(result.error, "Failed to list teams");
  return (result.data ?? []) as TeamRow[];
}

export async function getTeamById(id: string): Promise<Team | null> {
  if (!isSupabaseConfigured()) {
    return localTeams.find((team) => team.id === id) ?? null;
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  assertNoError(result.error, "Failed to load team");
  return (result.data as TeamRow | null) ?? null;
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  if (!isSupabaseConfigured()) {
    return localTeams.find((team) => team.slug === slug) ?? null;
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  assertNoError(result.error, "Failed to load team");
  return (result.data as TeamRow | null) ?? null;
}

export async function listPlayersByTeamId(teamId: string): Promise<Player[]> {
  const players = await listPlayers();
  return players.filter((player) => player.current_team_id === teamId);
}

export function deriveTeamSlug(name: string): string {
  return slugify(name);
}
