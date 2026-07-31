import type { Metadata } from "next";

import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo/routes";

export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  imageUrl?: string | null;
  ogType?: "website" | "profile" | "article";
  keywords?: readonly string[];
}

/**
 * Decision: use Next.js App Router Metadata API instead of next-seo.
 * Page titles are bare; root layout applies `%s | SITE_NAME` template.
 */
export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  imageUrl,
  ogType = "website",
  keywords,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const isRootTitle = title === SITE_NAME;
  const fullTitle = isRootTitle ? SITE_NAME : `${title} | ${SITE_NAME}`;
  const defaultOg = absoluteUrl("/opengraph-image");
  const images = [
    {
      url: imageUrl || defaultOg,
      width: 1200,
      height: 630,
      alt: fullTitle,
    },
  ];

  return {
    // Bare title so root `template` can append brand once.
    title: isRootTitle ? { absolute: SITE_NAME } : title,
    description,
    keywords: keywords ? [...keywords] : undefined,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type:
        ogType === "profile"
          ? "profile"
          : ogType === "article"
            ? "article"
            : "website",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      locale: "en_US",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl || defaultOg],
    },
  };
}

export const rootMetadata: Metadata = {
  ...createPageMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
    keywords: SITE_KEYWORDS,
  }),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  category: "sports",
  keywords: [...SITE_KEYWORDS],
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};
