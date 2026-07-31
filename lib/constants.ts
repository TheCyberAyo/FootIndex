export const SITE_NAME = "FootIndex";
export const SITE_TAGLINE = "Search any football player";
export const SITE_DESCRIPTION =
  "FootIndex is a football player search engine — career stats, comparisons, rankings, trophies, and season-by-season data for every player in our database.";
export const SITE_KEYWORDS = [
  "FootIndex",
  "football player search",
  "football stats",
  "player comparison",
  "career goals",
  "football rankings",
  "soccer stats",
  "Haaland stats",
  "Mbappé stats",
  "Messi stats",
  "Ronaldo stats",
  "Premier League stats",
  "Champions League goals",
] as const;
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

import { designTokens } from "@/lib/design-tokens";

/** Manchester City FC sky blue — matches `--brand` in CSS. */
export const BRAND_COLOR = designTokens.brand;

/** Public contact address (mailto on /contact). Override via env in production. */
export const SITE_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@footindex.com";

export interface NavItem {
  href: string;
  label: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/players", label: "Players" },
  { href: "/rankings", label: "Rankings" },
  { href: "/compare", label: "Compare" },
  { href: "/competition", label: "Competitions" },
  { href: "/predict", label: "Predict" },
  { href: "/stats", label: "Stats" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
];

export const FOOTER_NAV: NavItem[] = [
  { href: "/search", label: "Search" },
  { href: "/rankings", label: "Rankings" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/api-docs", label: "API" },
  { href: "/contact", label: "Contact" },
];
