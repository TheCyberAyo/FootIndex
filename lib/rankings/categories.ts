export interface RankingCategory {
  slug: string;
  title: string;
  description: string;
  metricLabel: string;
}

export const RANKING_CATEGORIES: RankingCategory[] = [
  {
    slug: "top-scorers",
    title: "Top Scorers",
    description: "Career goals across club and international football.",
    metricLabel: "Goals",
  },
  {
    slug: "top-assists",
    title: "Top Assists",
    description: "Players ranked by career assists.",
    metricLabel: "Assists",
  },
  {
    slug: "top-goal-contributions",
    title: "Top Goal Contributions",
    description: "Combined career goals and assists.",
    metricLabel: "G + A",
  },
  {
    slug: "top-international-scorers",
    title: "Top International Scorers",
    description: "Career goals for national teams.",
    metricLabel: "Intl goals",
  },
  {
    slug: "top-champions-league-scorers",
    title: "Top Champions League Scorers",
    description: "UEFA Champions League career goals.",
    metricLabel: "UCL goals",
  },
  {
    slug: "top-midfielders",
    title: "Top Midfielders",
    description: "Midfielders ranked by goal contributions.",
    metricLabel: "G + A",
  },
  {
    slug: "top-defenders",
    title: "Top Defenders",
    description: "Defenders ranked by career appearances.",
    metricLabel: "Apps",
  },
  {
    slug: "top-goalkeepers",
    title: "Top Goalkeepers",
    description: "Goalkeepers ranked by career appearances.",
    metricLabel: "Apps",
  },
  {
    slug: "top-young-players",
    title: "Top Young Players",
    description: "Under-23 players ranked by career goals.",
    metricLabel: "Goals",
  },
  {
    slug: "top-veterans",
    title: "Top Veterans",
    description: "Players aged 30+ ranked by career goals.",
    metricLabel: "Goals",
  },
];

const CATEGORY_BY_SLUG = new Map(
  RANKING_CATEGORIES.map((category) => [category.slug, category]),
);

export function getRankingCategory(slug: string): RankingCategory | null {
  return CATEGORY_BY_SLUG.get(slug) ?? null;
}

export function rankingPath(categorySlug: string): string {
  return `/rankings/${categorySlug}`;
}
