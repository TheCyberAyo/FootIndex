/**
 * JS mirror of CSS design tokens (styles/tokens.css + styles/brand.css).
 * Use for Recharts, OG images, and other non-Tailwind contexts.
 * Keep values in sync with CSS when tokens change.
 */

export const designTokens = {
  brand: "#6CABDD",
  brandForeground: "#FFFFFF",
  foreground: "#FAFAFA",
  background: "#000000",
  mutedForeground: "#A1A1AA",
  success: "#22C55E",
  warning: "#F5C518",
  error: "#EF4444",
  chartPlayerOne: "#FFFFFF",
  chartPlayerTwo: "#6CABDD",
  chartGrid: "rgba(255,255,255,0.12)",
  chartAxis: "rgba(255,255,255,0.45)",
  chartTooltipBg: "rgba(10,10,10,0.92)",
  chartTooltipBorder: "rgba(255,255,255,0.12)",
  chartMuted: "rgba(255,255,255,0.35)",
} as const;
