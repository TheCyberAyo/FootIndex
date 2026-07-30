import { hasCuratedCareer } from "@/lib/players/curated";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  fetchPlayerTransfers,
  fetchPlayerTrophies,
} from "@/services/api-football/endpoints";
import { assertNoError } from "@/services/errors";
import { ensureTeamByApiRef } from "@/services/reference/reference-entities.service";
import { mapTrophy } from "@/services/sync/mappers";

export interface PlayerEnrichmentResult {
  trophiesSynced: number;
  transfersSynced: number;
  skipped: boolean;
}

export async function syncPlayerTrophiesAndTransfers(input: {
  playerId: string;
  slug: string;
  apiFootballId: number;
}): Promise<PlayerEnrichmentResult> {
  if (hasCuratedCareer(input.slug)) {
    return { trophiesSynced: 0, transfersSynced: 0, skipped: true };
  }

  const supabase = createSupabaseAdminClient();
  let trophiesSynced = 0;
  let transfersSynced = 0;

  try {
    const trophyItems = await fetchPlayerTrophies(input.apiFootballId);
    await supabase.from("trophies").delete().eq("player_id", input.playerId);

    for (const item of trophyItems) {
      const mapped = mapTrophy(item);
      if (!mapped) {
        continue;
      }

      const inserted = await supabase.from("trophies").insert({
        player_id: input.playerId,
        name: mapped.name,
        season: mapped.season,
        year: mapped.year,
      });

      if (!inserted.error) {
        trophiesSynced += 1;
      }
    }
  } catch {
    // Trophy endpoint may fail on free plan — keep season sync success.
  }

  try {
    const transferGroups = await fetchPlayerTransfers(input.apiFootballId);
    await supabase.from("transfers").delete().eq("player_id", input.playerId);

    for (const group of transferGroups) {
      for (const transfer of group.transfers) {
        const fromTeamId = transfer.teams.out?.id
          ? await ensureTeamByApiRef({
              apiId: transfer.teams.out.id,
              name: transfer.teams.out.name,
              logo: transfer.teams.out.logo,
            })
          : null;

        const toTeamId = transfer.teams.in?.id
          ? await ensureTeamByApiRef({
              apiId: transfer.teams.in.id,
              name: transfer.teams.in.name,
              logo: transfer.teams.in.logo,
            })
          : null;

        const upsert = await supabase.from("transfers").upsert(
          {
            player_id: input.playerId,
            from_team_id: fromTeamId,
            to_team_id: toTeamId,
            transfer_date: transfer.date,
            transfer_type: transfer.type,
            fee_text: transfer.type,
          },
          { onConflict: "player_id,transfer_date,to_team_id" },
        );

        if (!upsert.error) {
          transfersSynced += 1;
        }
      }
    }
  } catch {
    // Transfers are best-effort on free plan.
  }

  const trophyCount = await supabase
    .from("trophies")
    .select("id", { count: "exact", head: true })
    .eq("player_id", input.playerId);

  assertNoError(trophyCount.error, "Failed to count trophies");

  const awardCount = await supabase
    .from("awards")
    .select("id", { count: "exact", head: true })
    .eq("player_id", input.playerId);

  assertNoError(awardCount.error, "Failed to count awards");

  await supabase
    .from("career_stats")
    .update({
      trophies_count: trophyCount.count ?? trophiesSynced,
      awards_count: awardCount.count ?? 0,
    })
    .eq("player_id", input.playerId);

  return { trophiesSynced, transfersSynced, skipped: false };
}
