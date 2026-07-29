export const SITE_NAME = "Haaland vs Mbappé";
export const SITE_DESCRIPTION =
  "Haaland vs Mbappé career comparison — Erling Haaland and Kylian Mbappé club and country goals, Champions League tallies, trophies, awards, and season-by-season stats.";
export const SITE_KEYWORDS = [
  "Haaland vs Mbappé",
  "Haaland vs Mbappe",
  "Erling Haaland",
  "Kylian Mbappé",
  "Kylian Mbappe",
  "Haaland career goals",
  "Mbappé career goals",
  "Haaland vs Mbappé stats",
  "Haaland vs Mbappé trophies",
  "Haaland vs Mbappé Champions League",
  "club vs country goals",
  "football comparison",
  "soccer stats",
] as const;
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Manchester City FC sky blue — site brand accent (matches `--brand` in CSS). */
export const BRAND_COLOR = "#6CABDD";

/** Public contact address (mailto on /contact). Override via env in production. */
export const SITE_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@haalandvsmbappe.com";

export const PLAYERS = {
  haaland: {
    slug: "haaland",
    name: "Erling Haaland",
    shortName: "Haaland",
    path: "/haaland",
  },
  mbappe: {
    slug: "mbappe",
    name: "Kylian Mbappé",
    shortName: "Mbappé",
    path: "/mbappe",
  },
} as const;

export interface NavItem {
  href: string;
  label: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/haaland", label: "Haaland" },
  { href: "/mbappe", label: "Mbappé" },
  { href: "/compare", label: "Compare" },
  { href: "/predict", label: "Predict" },
  { href: "/stats", label: "Stats" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
];

export const FOOTER_NAV: NavItem[] = [
  { href: "/haaland", label: "Haaland" },
  { href: "/mbappe", label: "Mbappé" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/api-docs", label: "API" },
  { href: "/contact", label: "Contact" },
];
