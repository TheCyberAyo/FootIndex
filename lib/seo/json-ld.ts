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
    question: "Who has more career goals — Haaland or Mbappé?",
    answer:
      "Compare Erling Haaland and Kylian Mbappé career goals side by side on the Compare page, including club goals, international (country) goals, and Champions League tallies.",
  },
  {
    question: "How do Haaland and Mbappé compare for club vs country?",
    answer:
      "Haaland vs Mbappé breaks down club and country achievements — goals for their teams and national sides, plus trophies and awards — with season-by-year search on Compare.",
  },
  {
    question: "Who is better — Haaland or Mbappé?",
    answer:
      "It depends on the metric. Haaland often leads finishing efficiency and goals-per-game, while Mbappé frequently leads creation and versatility. Use the career comparison, year search, charts, and community vote to decide.",
  },
  {
    question: "Where do the Haaland vs Mbappé stats come from?",
    answer:
      "Career club and country totals are curated baselines for accuracy. Season form and fixtures sync from API-Football into Supabase alongside trophies and awards.",
  },
];

export const ABOUT_FAQ: FaqItem[] = [
  {
    question: "What is Haaland vs Mbappé?",
    answer:
      "Haaland vs Mbappé is a football statistics site built to compare Erling Haaland and Kylian Mbappé career achievements for club and country — goals, trophies, awards, and season-by-season stats.",
  },
  {
    question: "Can I compare Haaland and Mbappé by season or year?",
    answer:
      "Yes. On Compare, search any season or calendar year to see club form side by side, plus international goals when you search a calendar year.",
  },
  {
    question: "Which stack powers the site?",
    answer:
      "Next.js 15 App Router, TypeScript, Tailwind, Supabase/PostgreSQL, React Query, Recharts, and API-Football — deployed for production on Vercel.",
  },
];
