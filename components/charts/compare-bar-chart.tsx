"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartMount } from "@/components/charts/chart-mount";
import { CHART_COLORS, type BarPoint } from "@/lib/charts";

interface CompareBarChartProps {
  data: BarPoint[];
  haalandName: string;
  mbappeName: string;
}

function BarBody({ data, haalandName, mbappeName }: CompareBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        barCategoryGap="28%"
      >
        <CartesianGrid
          stroke={CHART_COLORS.grid}
          vertical={false}
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="metric"
          tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-18}
          textAnchor="end"
          height={56}
        />
        <YAxis
          tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.tooltipBorder}`,
            borderRadius: 12,
            color: "#fff",
          }}
        />
        <Bar
          name={haalandName}
          dataKey="haaland"
          fill={CHART_COLORS.haaland}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          name={mbappeName}
          dataKey="mbappe"
          fill={CHART_COLORS.mbappe}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompareBarChart(props: CompareBarChartProps) {
  if (props.data.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-white/40">
        No bar metrics yet.
      </p>
    );
  }

  return (
    <ChartMount>
      <BarBody {...props} />
    </ChartMount>
  );
}
