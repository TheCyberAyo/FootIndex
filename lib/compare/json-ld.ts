import { absoluteUrl } from "@/lib/seo/routes";
import {
  createFaqJsonLd,
  type FaqItem,
  HOME_FAQ,
} from "@/lib/seo/json-ld";
import { isFeaturedRivalryCompare } from "@/lib/compare/paths";
import type { PlayerProfile } from "@/types/domain";

export function buildCompareFaqItems(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
): FaqItem[] {
  if (isFeaturedRivalryCompare(playerOne.player.slug, playerTwo.player.slug)) {
    return HOME_FAQ;
  }

  const a = playerOne.player.short_name;
  const b = playerTwo.player.short_name;
  const goalsOne = playerOne.career?.goals ?? 0;
  const goalsTwo = playerTwo.career?.goals ?? 0;
  const assistsOne = playerOne.career?.assists ?? 0;
  const assistsTwo = playerTwo.career?.assists ?? 0;

  return [
    {
      question: `Who has more career goals — ${a} or ${b}?`,
      answer: `${a} has ${goalsOne} career goals and ${b} has ${goalsTwo} career goals in our database. Use this page for club, country, and season breakdowns.`,
    },
    {
      question: `Who has more career assists — ${a} or ${b}?`,
      answer: `${a} has ${assistsOne} career assists and ${b} has ${assistsTwo} career assists. Scroll the comparison table for trophies and awards.`,
    },
    {
      question: `How do ${a} and ${b} compare?`,
      answer: `Compare ${playerOne.player.name} and ${playerTwo.player.name} side by side — career totals, season form, trophies, and head-to-head metrics on this page.`,
    },
  ];
}

export function createCompareArticleJsonLd(input: {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
  path: string;
}) {
  const { playerOne, playerTwo, path } = input;
  const headline = `${playerOne.player.short_name} vs ${playerTwo.player.short_name} Career Comparison`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: `${playerOne.player.name} vs ${playerTwo.player.name} — career goals, assists, trophies, and head-to-head stats.`,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    about: [
      {
        "@type": "Person",
        name: playerOne.player.name,
        url: absoluteUrl(`/player/${playerOne.player.slug}`),
      },
      {
        "@type": "Person",
        name: playerTwo.player.name,
        url: absoluteUrl(`/player/${playerTwo.player.slug}`),
      },
    ],
    inLanguage: "en",
  };
}

/** ItemList comparison schema (PROJECT_SPECIFICATION §86). */
export function createCompareComparisonJsonLd(input: {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
  path: string;
}) {
  const { playerOne, playerTwo, path } = input;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${playerOne.player.short_name} vs ${playerTwo.player.short_name}`,
    url: absoluteUrl(path),
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Person",
          name: playerOne.player.name,
          url: absoluteUrl(`/player/${playerOne.player.slug}`),
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Person",
          name: playerTwo.player.name,
          url: absoluteUrl(`/player/${playerTwo.player.slug}`),
        },
      },
    ],
  };
}

export function createCompareFaqJsonLd(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
) {
  return createFaqJsonLd(buildCompareFaqItems(playerOne, playerTwo));
}
