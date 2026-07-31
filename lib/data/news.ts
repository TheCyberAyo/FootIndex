import { SEED_NEWS_IDS } from "@/lib/data/seed-ids";
import type { NewsArticle } from "@/types/domain";

/**
 * Curated news — no third-party news API in v1.
 * Fixed UUIDs so comments/likes can target articles without a news table.
 */
export const CURATED_NEWS: NewsArticle[] = [
  {
    id: SEED_NEWS_IDS.haalandForm,
    slug: "haaland-city-cutting-edge",
    title: "Haaland’s cutting edge keeps City’s attack ruthless",
    excerpt:
      "A look at Erling Haaland’s season efficiency — goals per game, big-chance conversion, and why defenders still have no answer.",
    body: [
      "Erling Haaland continues to redefine what elite centre-forward output looks like in the Premier League and Europe.",
      "Beyond the raw goal tallies, his minutes-to-goals ratio and movement in the box remain the clearest edge Manchester City have in open play.",
      "For the Haaland vs Mbappé debate, this is the finishing argument: fewer touches, colder finishing, relentless penalty-box gravity.",
    ].join("\n\n"),
    publishedAt: "2026-07-20T09:00:00.000Z",
    tags: ["Haaland", "Man City", "Form"],
    playerSlugs: ["haaland"],
  },
  {
    id: SEED_NEWS_IDS.mbappeMadrid,
    slug: "mbappe-madrid-wide-threat",
    title: "Mbappé stretches Madrid’s attack from the left flank",
    excerpt:
      "Kylian Mbappé’s Real Madrid chapter is about more than goals — width, transitions, and chance creation under pressure.",
    body: [
      "Kylian Mbappé’s speed still breaks lines, but the Madrid version is learning when to stay wide and when to crash the box.",
      "Assists and progressive carries sit alongside his finishing — a fuller creator profile than early career highlights suggested.",
      "In head-to-head charts, that creation edge is where Mbappé often pulls ahead of pure No. 9 archetypes.",
    ].join("\n\n"),
    publishedAt: "2026-07-18T11:30:00.000Z",
    tags: ["Mbappé", "Real Madrid", "Tactics"],
    playerSlugs: ["mbappe"],
  },
  {
    id: SEED_NEWS_IDS.rivalryPreview,
    slug: "footindex-featured-compare-debate",
    title: "Haaland vs Mbappé: what the numbers actually settle",
    excerpt:
      "Goals, trophies, and efficiency — a preview of the metrics that fuel the site’s live comparison engine.",
    body: [
      "The rivalry is cultural as much as statistical: Norway’s clinical striker versus France’s generational attacker.",
      "Career goals, Champions League tallies, and goals-per-game tell different stories depending on which era and competition you weight.",
      "Vote, predict upcoming matches, and dig into the charts — the debate is better when the data is on the table.",
    ].join("\n\n"),
    publishedAt: "2026-07-15T08:00:00.000Z",
    tags: ["Rivalry", "Analysis"],
    playerSlugs: ["haaland", "mbappe"],
  },
];

export function listCuratedNews(): NewsArticle[] {
  return [...CURATED_NEWS].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getCuratedNewsBySlug(slug: string): NewsArticle | null {
  return CURATED_NEWS.find((article) => article.slug === slug) ?? null;
}

export function getCuratedNewsById(id: string): NewsArticle | null {
  return CURATED_NEWS.find((article) => article.id === id) ?? null;
}
