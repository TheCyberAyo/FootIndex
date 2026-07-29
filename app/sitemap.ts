import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/routes";
import { listStaticSitemapEntries } from "@/lib/seo/sitemaps";

/** Main sitemap — static indexable pages (PROJECT_SPECIFICATION §87). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return listStaticSitemapEntries().map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
