import { formatCompareValue } from "@/lib/compare";
import type { CompareMetric } from "@/lib/compare";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";

interface CompareMetricsTableProps {
  metrics: CompareMetric[];
  playerOneName: string;
  playerTwoName: string;
}

/**
 * Head-to-head metrics as a table — same 3-column layout on mobile and desktop.
 */
export function CompareMetricsTable({
  metrics,
  playerOneName,
  playerTwoName,
}: CompareMetricsTableProps) {
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-white/[0.03] text-xs tracking-wide text-muted-foreground uppercase">
              <th
                scope="col"
                className="px-3 py-3 text-left font-medium sm:px-4"
                title={playerOneName}
              >
                <span className="line-clamp-2">{playerOneName}</span>
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-center font-medium sm:px-4"
              >
                Metric
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-right font-medium sm:px-4"
                title={playerTwoName}
              >
                <span className="line-clamp-2">{playerTwoName}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              const playerOneLeads = metric.winner === "playerOne";
              const playerTwoLeads = metric.winner === "playerTwo";
              const playerOneDisplay = formatCompareValue(
                metric.playerOneValue,
                metric.format,
              );
              const playerTwoDisplay = formatCompareValue(
                metric.playerTwoValue,
                metric.format,
              );

              return (
                <tr
                  key={metric.key}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <td
                    className={cn(
                      "px-3 py-3 font-display text-base font-bold tabular-nums sm:px-4 sm:text-lg",
                      playerOneLeads ? "text-brand" : "text-foreground",
                    )}
                  >
                    {playerOneDisplay}
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4">
                    <p className="text-[11px] leading-tight font-medium tracking-wide text-muted-foreground uppercase sm:text-xs">
                      {metric.label}
                    </p>
                    {metric.winner === "tie" || metric.delta == null ? (
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {metric.playerOneValue == null ||
                        metric.playerTwoValue == null
                          ? "Unavailable"
                          : "Tied"}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[10px] text-brand/80">
                        Δ {formatCompareValue(metric.delta, metric.format)}
                      </p>
                    )}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-3 text-right font-display text-base font-bold tabular-nums sm:px-4 sm:text-lg",
                      playerTwoLeads ? "text-brand" : "text-foreground",
                    )}
                  >
                    {playerTwoDisplay}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
