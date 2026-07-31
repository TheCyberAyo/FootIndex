import Link from "next/link";
import Image from "next/image";

import { GlassCard } from "@/components/shared/glass-card";
import type { CompetitionStandingRow } from "@/services/standings/standings.service";

interface StandingsTableProps {
  rows: CompetitionStandingRow[];
  emptyLabel?: string;
}

export function StandingsTable({
  rows,
  emptyLabel = "No team standings available yet.",
}: StandingsTableProps) {
  if (rows.length === 0) {
    return (
      <GlassCard className="p-5 text-sm text-muted-foreground">{emptyLabel}</GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs tracking-wide text-foreground/40 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-3 py-3 font-medium">Team</th>
              <th className="px-3 py-3 font-medium">Players</th>
              <th className="px-3 py-3 font-medium">Apps</th>
              <th className="px-3 py-3 font-medium">Goals</th>
              <th className="px-5 py-3 font-medium">Assists</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.teamId}
                className="border-t border-border/60 text-foreground/80"
              >
                <td className="px-5 py-3 font-medium text-brand">{row.rank}</td>
                <td className="px-3 py-3">
                  <Link
                    href={row.href}
                    className="inline-flex items-center gap-2 font-medium text-foreground hover:text-brand"
                  >
                    {row.logoUrl ? (
                      <Image
                        src={row.logoUrl}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5 object-contain"
                      />
                    ) : null}
                    {row.teamName}
                  </Link>
                </td>
                <td className="px-3 py-3">{row.players}</td>
                <td className="px-3 py-3">{row.appearances}</td>
                <td className="px-3 py-3 text-brand">{row.goals}</td>
                <td className="px-5 py-3">{row.assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
