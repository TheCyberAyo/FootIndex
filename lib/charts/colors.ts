import { BRAND_COLOR } from "@/lib/constants";

/**
 * Chart palette — Haaland white, Mbappé brand City blue on dark glass.
 * Decision: keep series colors fixed so legends stay consistent site-wide.
 */

export const CHART_COLORS = {
  haaland: "#FFFFFF",
  mbappe: BRAND_COLOR,
  club: BRAND_COLOR,
  international: "#FFFFFF",
  grid: "rgba(255,255,255,0.12)",
  axis: "rgba(255,255,255,0.45)",
  tooltipBg: "rgba(10,10,10,0.92)",
  tooltipBorder: "rgba(255,255,255,0.12)",
  muted: "rgba(255,255,255,0.35)",
} as const;

export const CHART_HEIGHT = {
  sm: 240,
  md: 280,
  lg: 320,
} as const;
