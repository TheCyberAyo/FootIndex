import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/routes";
import { listRankingsSitemapEntries } from "@/lib/seo/sitemaps";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return listRankingsSitemapEntries().map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
