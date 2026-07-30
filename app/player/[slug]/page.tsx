import { notFound } from "next/navigation";

import {
  PlayerRoutePage,
  generatePlayerRouteMetadata,
} from "@/components/players/player-route-page";
import { isValidPlayerSlugFormat } from "@/lib/players/paths";
import { createPageMetadata } from "@/lib/seo";
import { listPrerenderPlayerSlugs } from "@/lib/seo/prerender";

export const revalidate = 60;
export const dynamicParams = true;

interface PlayerSlugPageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-render featured + marquee players — full catalog via dynamicParams + player sitemap. */
export async function generateStaticParams() {
  const slugs = await listPrerenderPlayerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PlayerSlugPageProps) {
  const { slug } = await params;
  if (!isValidPlayerSlugFormat(slug)) {
    return createPageMetadata({
      title: "Player not found",
      description: "This player profile does not exist.",
      path: `/player/${slug}`,
      noIndex: true,
    });
  }
  return generatePlayerRouteMetadata(slug);
}

export default async function PlayerSlugPage({ params }: PlayerSlugPageProps) {
  const { slug } = await params;
  if (!isValidPlayerSlugFormat(slug)) {
    notFound();
  }

  return <PlayerRoutePage slug={slug} />;
}
