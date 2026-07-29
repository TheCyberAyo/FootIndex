import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/routes";
import { listNewsSitemapEntries } from "@/lib/seo/sitemaps";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return listNewsSitemapEntries().map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
