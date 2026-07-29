import type { NextConfig } from "next";

/**
 * Phase 1 config: allow API-Football media hosts.
 * Supabase storage host is added in Phase 2 once the project URL is known
 * (Next.js remotePatterns need an exact hostname, not a wildcard guess).
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/haaland",
        destination: "/player/haaland",
        permanent: true,
      },
      {
        source: "/mbappe",
        destination: "/player/mbappe",
        permanent: true,
      },
      {
        source: "/players/:slug",
        destination: "/player/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
