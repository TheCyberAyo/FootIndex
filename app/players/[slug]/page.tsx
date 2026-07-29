import { notFound } from "next/navigation";

import {
  PlayerRoutePage,
  generatePlayerRouteMetadata,
} from "@/components/players/player-route-page";
import { createPageMetadata } from "@/lib/seo";
import {
  PLAYER_SLUGS,
  isPlayerSlug,
  type PlayerSlug,
} from "@/lib/players/load-profile";

export const revalidate = 60;

interface PlayersSlugPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic player route for future expansion.
 * Canonical short URLs remain /haaland and /mbappe.
 */
export function generateStaticParams() {
  return PLAYER_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PlayersSlugPageProps) {
  const { slug } = await params;
  if (!isPlayerSlug(slug)) {
    return createPageMetadata({
      title: "Player not found",
      description: "This player profile does not exist.",
      path: `/players/${slug}`,
      noIndex: true,
    });
  }
  return generatePlayerRouteMetadata(slug);
}

export default async function PlayersSlugPage({
  params,
}: PlayersSlugPageProps) {
  const { slug } = await params;
  if (!isPlayerSlug(slug)) {
    notFound();
  }

  return <PlayerRoutePage slug={slug as PlayerSlug} />;
}
