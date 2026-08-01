import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";
import { SITEMAP_PATHS } from "@/lib/seo/sitemaps";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/sign-up", "/account", "/auth/", "/compare?"],
      },
    ],
    sitemap: [
      `${base}${SITEMAP_PATHS.main}`,
      `${base}${SITEMAP_PATHS.players}`,
      `${base}${SITEMAP_PATHS.compare}`,
      `${base}${SITEMAP_PATHS.news}`,
      `${base}${SITEMAP_PATHS.rankings}`,
      `${base}${SITEMAP_PATHS.teams}`,
      `${base}${SITEMAP_PATHS.competitions}`,
    ],
    host: base,
  };
}
