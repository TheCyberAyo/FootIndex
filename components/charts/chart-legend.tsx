import { CHART_COLORS } from "@/lib/charts";
import { cn } from "@/lib/utils";

interface ChartLegendProps {
  items: Array<{
    label: string;
    color: string;
  }>;
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <ul className={cn("flex flex-wrap gap-3 text-xs text-white/60", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function HaalandMbappeLegend({
  haalandName,
  mbappeName,
}: {
  haalandName: string;
  mbappeName: string;
}) {
  return (
    <ChartLegend
      items={[
        { label: haalandName, color: CHART_COLORS.haaland },
        { label: mbappeName, color: CHART_COLORS.mbappe },
      ]}
    />
  );
}
