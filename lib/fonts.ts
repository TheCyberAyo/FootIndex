import { DM_Sans, Syne } from "next/font/google";

/**
 * Typography choices:
 * - Syne: expressive display face for hero titles (not Inter/Geist/system).
 * - DM Sans: clean body for long-form readability and dense stats.
 * Both subset to latin for Core Web Vitals (smaller font payload).
 */
export const fontDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const fontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
