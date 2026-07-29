"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ChartMount } from "@/components/charts/chart-mount";
import { CHART_COLORS, type RadarPoint } from "@/lib/charts";

interface CompareRadarChartProps {
  data: RadarPoint[];
  haalandName: string;
  mbappeName: string;
}

function RadarBody({
  data,
  haalandName,
  mbappeName,
}: CompareRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke={CHART_COLORS.grid} />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: CHART_COLORS.muted, fontSize: 10 }}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.tooltipBorder}`,
            borderRadius: 12,
            color: "#fff",
          }}
        />
        <Radar
          name={haalandName}
          dataKey="haaland"
          stroke={CHART_COLORS.haaland}
          fill={CHART_COLORS.haaland}
          fillOpacity={0.18}
          strokeWidth={2}
        />
        <Radar
          name={mbappeName}
          dataKey="mbappe"
          stroke={CHART_COLORS.mbappe}
          fill={CHART_COLORS.mbappe}
          fillOpacity={0.22}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function CompareRadarChart(props: CompareRadarChartProps) {
  if (props.data.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-white/40">
        No radar metrics yet.
      </p>
    );
  }

  return (
    <ChartMount>
      <RadarBody {...props} />
    </ChartMount>
  );
}
