import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/routes";
import { listCompetitionSitemapEntries } from "@/lib/seo/sitemaps";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const entries = await listCompetitionSitemapEntries();

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
