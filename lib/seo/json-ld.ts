import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo/routes";
import type { NewsArticle } from "@/types/domain";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function createWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function createWebPageJsonLd(input: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(input.path)}#webpage`,
    url: absoluteUrl(input.path),
    name: input.title,
    description: input.description,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    inLanguage: "en",
  };
}

export function createNewsArticleJsonLd(article: NewsArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
    keywords: article.tags.join(", "),
  };
}

export const HOME_FAQ: FaqItem[] = [
  {
    question: "What is FootIndex?",
    answer:
      "FootIndex is a football player search engine. Search any player in our database for career stats, season breakdowns, trophies, comparisons, and rankings.",
  },
  {
    question: "How do I find a player?",
    answer:
      "Use the search bar on the homepage or header, or browse rankings and team pages. Every player with a profile has a URL like /player/erling-haaland.",
  },
  {
    question: "How are career stats calculated?",
    answer:
      "Featured players Haaland and Mbappé use curated career baselines for accuracy. Other players roll up from synced season rows after API-Football sync.",
  },
  {
    question: "Can I compare any two players?",
    answer:
      "Yes — open /compare/player-one/player-two for any two slugs in the database. FootIndex also includes season/year search and a community vote on featured comparisons.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "Player profiles and season stats sync from API-Football into Supabase. Pages read from our database, never directly from the vendor API.",
  },
];

export const ABOUT_FAQ: FaqItem[] = [
  {
    question: "What is FootIndex?",
    answer:
      "FootIndex is a football statistics platform built as a player search engine — profiles, comparisons, rankings, teams, and competitions with modern UX and strong SEO.",
  },
  {
    question: "How do I add more players?",
    answer:
      "Seed the starter catalog via POST /api/players/catalog (admin), or import individual API-Football IDs via POST /api/players/import, then run sync.",
  },
  {
    question: "Which stack powers the site?",
    answer:
      "Next.js 15 App Router, TypeScript, Tailwind, Supabase/PostgreSQL, React Query, Recharts, and API-Football — deployed for production on Vercel.",
  },
];
