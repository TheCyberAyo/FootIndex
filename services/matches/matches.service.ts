import { RECENT_MATCHES_PER_PLAYER } from "@/lib/api-football/constants";
import {
  buildLocalLiveScoreCards,
  localMatches,
} from "@/lib/data/local-seed";
import { SEED_PLAYER_IDS } from "@/lib/data/seed-ids";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import type { MatchRow, PlayerStatRow, TeamRow } from "@/types/database";
import type { LiveScoreCard, Match } from "@/types/domain";

export { RECENT_MATCHES_PER_PLAYER };

interface MatchWithTeams extends MatchRow {
  home_team: TeamRow | TeamRow[] | null;
  away_team: TeamRow | TeamRow[] | null;
}

interface PlayerStatWithMatch extends PlayerStatRow {
  match: MatchWithTeams | MatchWithTeams[] | null;
}

function mapTeam(
  team: TeamRow | TeamRow[] | null | undefined,
): TeamRow | null {
  if (!team) {
    return null;
  }
  return Array.isArray(team) ? (team[0] ?? null) : team;
}

function mapMatch(row: MatchWithTeams): Match {
  return {
    ...row,
    home_team: mapTeam(row.home_team),
    away_team: mapTeam(row.away_team),
  };
}

function takeRecentPerPlayer(cards: LiveScoreCard[]): LiveScoreCard[] {
  const bySlug = new Map<string, LiveScoreCard[]>();

  for (const card of cards) {
    const slug = card.playerSlug ?? "unknown";
    const list = bySlug.get(slug) ?? [];
    list.push(card);
    bySlug.set(slug, list);
  }

  const result: LiveScoreCard[] = [];
  const slugs = Array.from(bySlug.keys()).sort();

  for (const slug of slugs) {
    const list = (bySlug.get(slug) ?? [])
      .slice()
      .sort((a, b) => b.match.kickoff_at.localeCompare(a.match.kickoff_at))
      .slice(0, RECENT_MATCHES_PER_PLAYER);
    result.push(...list);
  }

  return result.sort((a, b) =>
    b.match.kickoff_at.localeCompare(a.match.kickoff_at),
  );
}

/**
 * Recent matches only where Haaland or Mbappé have a player_stats row
 * (i.e. they participated). Caps at {@link RECENT_MATCHES_PER_PLAYER} each.
 */
export async function listLiveScoreCards(): Promise<LiveScoreCard[]> {
  if (!isSupabaseConfigured()) {
    return takeRecentPerPlayer(buildLocalLiveScoreCards());
  }

  try {
    const supabase = createSupabasePublicClient();
    const result = await supabase
      .from("player_stats")
      .select(
        `
        *,
        match:matches!player_stats_match_id_fkey(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        ),
        player:players!player_stats_player_id_fkey(id, slug)
      `,
      )
      .in("player_id", [SEED_PLAYER_IDS.haaland, SEED_PLAYER_IDS.mbappe]);

    assertNoError(result.error, "Failed to load player match appearances");

    type Row = PlayerStatWithMatch & {
      player: { id: string; slug: string } | { id: string; slug: string }[] | null;
    };

    const cards: LiveScoreCard[] = [];
    for (const row of (result.data ?? []) as Row[]) {
      const matchRow = Array.isArray(row.match) ? row.match[0] : row.match;
      if (!matchRow) {
        continue;
      }
      const player = Array.isArray(row.player) ? row.player[0] : row.player;
      cards.push({
        match: mapMatch(matchRow),
        playerStats: {
          id: row.id,
          player_id: row.player_id,
          match_id: row.match_id,
          team_id: row.team_id,
          minutes: row.minutes,
          goals: row.goals,
          assists: row.assists,
          shots: row.shots,
          shots_on_target: row.shots_on_target,
          passes: row.passes,
          tackles: row.tackles,
          yellow_cards: row.yellow_cards,
          red_cards: row.red_cards,
          rating: row.rating,
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
        playerSlug: player?.slug ?? null,
      });
    }

    const limited = takeRecentPerPlayer(cards);
    if (limited.length > 0) {
      return limited;
    }

    return takeRecentPerPlayer(buildLocalLiveScoreCards());
  } catch {
    return takeRecentPerPlayer(buildLocalLiveScoreCards());
  }
}

/**
 * Unique recent matches from player appearances (max 5 per player).
 */
export async function listRecentMatches(
  limit = RECENT_MATCHES_PER_PLAYER * 2,
): Promise<Match[]> {
  const cards = await listLiveScoreCards();
  const seen = new Set<string>();
  const matches: Match[] = [];

  for (const card of cards) {
    if (seen.has(card.match.id)) {
      continue;
    }
    seen.add(card.match.id);
    matches.push(card.match);
    if (matches.length >= limit) {
      break;
    }
  }

  if (matches.length > 0) {
    return matches;
  }

  // Local fallback without participation rows (should be rare).
  return localMatches
    .slice()
    .sort((a, b) => b.kickoff_at.localeCompare(a.kickoff_at))
    .slice(0, limit);
}

/**
 * Upcoming fixtures for predictions — scheduled (or live) kickoffs from now.
 */
export async function listUpcomingMatches(limit = 8): Promise<Match[]> {
  const nowIso = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return localMatches
      .filter(
        (match) =>
          (match.status === "scheduled" || match.status === "live") &&
          match.kickoff_at >= nowIso,
      )
      .sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at))
      .slice(0, limit);
  }

  try {
    const supabase = createSupabasePublicClient();
    const result = await supabase
      .from("matches")
      .select(
        "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)",
      )
      .in("status", ["scheduled", "live"])
      .gte("kickoff_at", nowIso)
      .order("kickoff_at", { ascending: true })
      .limit(limit);

    assertNoError(result.error, "Failed to list upcoming matches");
    const rows = ((result.data ?? []) as MatchWithTeams[]).map(mapMatch);

    if (rows.length > 0) {
      return rows;
    }

    return localMatches
      .filter(
        (match) =>
          (match.status === "scheduled" || match.status === "live") &&
          match.kickoff_at >= nowIso,
      )
      .sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at))
      .slice(0, limit);
  } catch {
    return localMatches
      .filter(
        (match) =>
          (match.status === "scheduled" || match.status === "live") &&
          match.kickoff_at >= nowIso,
      )
      .sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at))
      .slice(0, limit);
  }
}
