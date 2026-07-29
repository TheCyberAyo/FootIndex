import { formatCompareValue } from "@/lib/compare";
import type { CompareMetric } from "@/lib/compare";
import { cn } from "@/lib/utils";

interface CompareMetricRowProps {
  metric: CompareMetric;
}

/**
 * One metric row: Haaland | label | Mbappé with brand blue leader highlight.
 */
export function CompareMetricRow({ metric }: CompareMetricRowProps) {
  const haalandLeads = metric.winner === "haaland";
  const mbappeLeads = metric.winner === "mbappe";
  const haalandDisplay = formatCompareValue(
    metric.haalandValue,
    metric.format,
  );
  const mbappeDisplay = formatCompareValue(metric.mbappeValue, metric.format);

  const max = Math.max(metric.haalandValue, metric.mbappeValue, 1);
  const haalandWidth = Math.round((metric.haalandValue / max) * 100);
  const mbappeWidth = Math.round((metric.mbappeValue / max) * 100);

  return (
    <article className="rounded-2xl border border-glass-border bg-glass px-4 py-4 backdrop-blur-xl sm:px-5">
      {/* Mobile: label first, then values */}
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
              haalandLeads ? "text-brand" : "text-white",
            )}
          >
            {haalandDisplay}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                haalandLeads ? "bg-brand" : "bg-white/40",
              )}
              style={{ width: `${haalandWidth}%` }}
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
              mbappeLeads ? "text-brand" : "text-white",
            )}
          >
            {mbappeDisplay}
          </p>
          <div className="mt-2 ml-auto h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={cn(
                "ml-auto h-full rounded-full transition-all",
                mbappeLeads ? "bg-brand" : "bg-white/40",
              )}
              style={{ width: `${mbappeWidth}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
