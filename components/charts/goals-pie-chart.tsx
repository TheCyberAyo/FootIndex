"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartMount } from "@/components/charts/chart-mount";
import { CHART_COLORS, type PieSlice } from "@/lib/charts";

interface GoalsPieChartProps {
  data: PieSlice[];
}

const SLICE_COLORS: Record<string, string> = {
  club: CHART_COLORS.club,
  international: CHART_COLORS.international,
};

function PieBody({ data }: GoalsPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="52%"
          outerRadius="78%"
          paddingAngle={3}
          stroke="transparent"
        >
          {data.map((slice) => (
            <Cell
              key={slice.key}
              fill={SLICE_COLORS[slice.key] ?? CHART_COLORS.muted}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.tooltipBorder}`,
            borderRadius: 12,
            color: "#fff",
          }}
          formatter={(value) => [
            typeof value === "number" ? value : Number(value),
            "Goals",
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GoalsPieChart({ data }: GoalsPieChartProps) {
  if (data.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-white/40">
        No goals split yet.
      </p>
    );
  }

  return (
    <ChartMount>
      <PieBody data={data} />
    </ChartMount>
  );
}
