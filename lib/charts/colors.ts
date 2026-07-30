import { designTokens } from "@/lib/design-tokens";

/**
 * Chart palette — mirrors CSS tokens (--chart-* in styles/tokens.css).
 */

export const CHART_COLORS = {
  haaland: designTokens.chartPlayerOne,
  mbappe: designTokens.chartPlayerTwo,
  club: designTokens.chartPlayerTwo,
  international: designTokens.chartPlayerOne,
  grid: designTokens.chartGrid,
  axis: designTokens.chartAxis,
  tooltipBg: designTokens.chartTooltipBg,
  tooltipBorder: designTokens.chartTooltipBorder,
  muted: designTokens.chartMuted,
} as const;

export const CHART_HEIGHT = {
  sm: 240,
  md: 280,
  lg: 320,
} as const;
