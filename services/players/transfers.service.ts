import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { PlayerTransfer } from "@/types/domain";
import type { TeamRow, TransferRow } from "@/types/database";

export async function listTransfersByPlayerId(
  playerId: string,
): Promise<PlayerTransfer[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("transfers")
    .select("*")
    .eq("player_id", playerId)
    .order("transfer_date", { ascending: false });

  if (result.error || !result.data?.length) {
    return [];
  }

  const transfers = result.data as TransferRow[];
  const teamIds = [
    ...new Set(
      transfers.flatMap((row) =>
        [row.from_team_id, row.to_team_id].filter(
          (id): id is string => id != null,
        ),
      ),
    ),
  ];

  const teamMap = new Map<string, TeamRow>();
  if (teamIds.length > 0) {
    const teamsResult = await supabase.from("teams").select("*").in("id", teamIds);
    if (!teamsResult.error) {
      for (const team of (teamsResult.data ?? []) as TeamRow[]) {
        teamMap.set(team.id, team);
      }
    }
  }

  return transfers.map((row) => ({
    id: row.id,
    transferDate: row.transfer_date,
    transferType: row.transfer_type,
    feeText: row.fee_text,
    fromTeam: row.from_team_id ? teamMap.get(row.from_team_id) ?? null : null,
    toTeam: row.to_team_id ? teamMap.get(row.to_team_id) ?? null : null,
  }));
}
