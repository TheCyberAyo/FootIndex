import { formatCompareValue } from "@/lib/compare";
import type { CompareMetric } from "@/lib/compare";
import { cn } from "@/lib/utils";

interface CompareMetricRowProps {
  metric: CompareMetric;
}

/**
 * One metric row: player one | label | player two with brand blue leader highlight.
 */
export function CompareMetricRow({ metric }: CompareMetricRowProps) {
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

  const max = Math.max(metric.playerOneValue, metric.playerTwoValue, 1);
  const playerOneWidth = Math.round((metric.playerOneValue / max) * 100);
  const playerTwoWidth = Math.round((metric.playerTwoValue / max) * 100);

  return (
    <article className="rounded-2xl border border-glass-border bg-glass px-4 py-4 backdrop-blur-xl sm:px-5">
      <div className="mb-3 text-center sm:hidden">
        <p className="text-xs tracking-[0.18em] text-white/45 uppercase">
          {metric.label}
        </p>
        {metric.winner !== "tie" ? (
          <p className="mt-1 text-[11px] text-brand">
            Δ {formatCompareValue(metric.delta, metric.format)}
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-white/35">Tied</p>
        )}
      </div>

      <div className="grid grid-cols-2 items-end gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="min-w-0">
          <p
            className={cn(
              "font-display text-2xl font-extrabold sm:text-3xl",
              playerOneLeads ? "text-brand" : "text-white",
            )}
          >
            {playerOneDisplay}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                playerOneLeads ? "bg-brand" : "bg-white/40",
              )}
              style={{ width: `${playerOneWidth}%` }}
            />
          </div>
        </div>

        <div className="col-span-2 order-first hidden text-center sm:order-none sm:col-span-1 sm:block">
          <p className="text-xs tracking-[0.18em] text-white/45 uppercase">
            {metric.label}
          </p>
          {metric.winner !== "tie" ? (
            <p className="mt-1 text-[11px] text-white/35">
              Lead by {formatCompareValue(metric.delta, metric.format)}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-white/35">Even</p>
          )}
        </div>

        <div className="min-w-0 text-right">
          <p
            className={cn(
              "font-display text-2xl font-extrabold sm:text-3xl",
              playerTwoLeads ? "text-brand" : "text-white",
            )}
          >
            {playerTwoDisplay}
          </p>
          <div className="mt-2 ml-auto h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={cn(
                "ml-auto h-full rounded-full transition-all",
                playerTwoLeads ? "bg-brand" : "bg-white/40",
              )}
              style={{ width: `${playerTwoWidth}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
