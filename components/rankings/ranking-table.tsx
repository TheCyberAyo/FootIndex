import Link from "next/link";

import { GlassCard } from "@/components/shared/glass-card";
import { formatPosition } from "@/lib/players/format";
import { playerPath } from "@/lib/players/paths";
import type { RankingEntry } from "@/types/domain";

interface RankingTableProps {
  entries: RankingEntry[];
  metricLabel: string;
  emptyMessage?: string;
}

export function RankingTable({
  entries,
  metricLabel,
  emptyMessage = "No players match this ranking yet.",
}: RankingTableProps) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs tracking-wide text-foreground/40 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-3 py-3 font-medium">Player</th>
              <th className="px-3 py-3 font-medium">Club</th>
              <th className="px-3 py-3 font-medium">Position</th>
              <th className="px-5 py-3 font-medium text-right">{metricLabel}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-foreground/50">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.player.id}
                  className="border-t border-border/60 text-foreground/80"
                >
                  <td className="px-5 py-3 font-medium text-brand">
                    {entry.rank}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={playerPath(entry.player.slug)}
                      className="font-medium text-foreground hover:text-brand"
                    >
                      {entry.player.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    {entry.player.current_team?.name ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    {formatPosition(entry.player.position)}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-brand">
                    {entry.valueLabel}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
