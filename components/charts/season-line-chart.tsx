"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartMount } from "@/components/charts/chart-mount";
import {
  CHART_COLORS,
  type DualSeasonProgressPoint,
  type SeasonProgressPoint,
} from "@/lib/charts";

interface SeasonLineChartProps {
  data: SeasonProgressPoint[];
}

interface DualSeasonLineChartProps {
  data: DualSeasonProgressPoint[];
  playerOneName: string;
  playerTwoName: string;
}

function SeasonLineBody({ data }: SeasonLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          stroke={CHART_COLORS.grid}
          vertical={false}
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="season"
          tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.tooltipBorder}`,
            borderRadius: 12,
            color: "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="goals"
          name="Goals"
          stroke={CHART_COLORS.mbappe}
          strokeWidth={2.5}
          dot={{ r: 3, fill: CHART_COLORS.mbappe }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="assists"
          name="Assists"
          stroke={CHART_COLORS.haaland}
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={{ r: 3, fill: CHART_COLORS.haaland }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DualSeasonLineBody({
  data,
  playerOneName,
  playerTwoName,
}: DualSeasonLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          stroke={CHART_COLORS.grid}
          vertical={false}
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="season"
          tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.tooltipBorder}`,
            borderRadius: 12,
            color: "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="playerOne"
          name={playerOneName}
          stroke={CHART_COLORS.haaland}
          strokeWidth={2.5}
          dot={{ r: 3, fill: CHART_COLORS.haaland }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="playerTwo"
          name={playerTwoName}
          stroke={CHART_COLORS.mbappe}
          strokeWidth={2.5}
          dot={{ r: 3, fill: CHART_COLORS.mbappe }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SeasonLineChart({ data }: SeasonLineChartProps) {
  if (data.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-white/40">
        No season rows yet. Run a players sync.
      </p>
    );
  }

  return (
    <ChartMount>
      <SeasonLineBody data={data} />
    </ChartMount>
  );
}

export function DualSeasonLineChart(props: DualSeasonLineChartProps) {
  if (props.data.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-white/40">
        No season rows yet. Run a players sync.
      </p>
    );
  }

  return (
    <ChartMount>
      <DualSeasonLineBody {...props} />
    </ChartMount>
  );
}
