import Link from "next/link";

import { FeaturedRivalrySection } from "@/components/home/featured-rivalry-section";
import { AdPlacement } from "@/components/ads/ad-placement";
import { HomeHero } from "@/components/home/home-hero";
import { LiveScoresSectionClient } from "@/components/home/live-scores-section-client";
import { TrendingPlayersGrid } from "@/components/home/trending-players-grid";
import { RankingTable } from "@/components/rankings/ranking-table";
import { PredictionsSection } from "@/components/predictions/predictions-section";
import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  HOME_FAQ,
} from "@/lib/seo/json-ld";
import {
  getFeaturedRivalryProfiles,
  getTopScorersPreview,
  listLiveScoreCards,
  listMostSearchedPlayers,
} from "@/services";
import { RECENT_MATCHES_PER_PLAYER } from "@/lib/api-football/constants";

export const metadata = createPageMetadata({
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const revalidate = 60;

const FEATURE_CARDS = [
  {
    title: "Player search",
    body: "Find any footballer in our database instantly.",
  },
  {
    title: "Career stats",
    body: "Goals, assists, trophies, and season breakdowns.",
  },
  {
    title: "Head-to-head",
    body: "Compare any two players side by side.",
  },
  {
    title: "Rankings",
    body: "Top scorers, assists, and position leaderboards.",
  },
  {
    title: "Teams & competitions",
    body: "Squads, competition hubs, and top scorers.",
  },
  {
    title: "Community",
    body: "Votes, predictions, and comments on key pages.",
  },
] as const;

export default async function HomePage() {
  const [{ playerOne, playerTwo }, liveCards, trending, topScorers] =
    await Promise.all([
      getFeaturedRivalryProfiles(),
      listLiveScoreCards(),
      listMostSearchedPlayers(9),
      getTopScorersPreview(5),
    ]);

  const initialHasLive = liveCards.some(
    (card) => card.match.status === "live",
  );

  return (
    <>
      <JsonLd
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }]),
          createFaqJsonLd(HOME_FAQ),
        ]}
      />
      <HomeHero trending={trending} />

      <Section containerClassName="py-6 sm:py-8">
        <AdPlacement slotKey="home" format="horizontal" minHeight={90} />
      </Section>

      <Section
        eyebrow="Discover"
        title="Most searched players"
        description="Popular profiles from recent search activity — falls back to top scorers when search data is sparse."
      >
        <TrendingPlayersGrid players={trending} />
        <div className="mt-6">
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/search">Search all players</Link>
          </Button>
        </div>
      </Section>

      <Section
        eyebrow="Recent appearances"
        title="Last matches played"
        description={`Most recent ${RECENT_MATCHES_PER_PLAYER} synced appearances per tracked player. Cards refresh while a match is live.`}
      >
        <LiveScoresSectionClient
          initialCards={liveCards}
          initialHasLive={initialHasLive}
        />
      </Section>

      <FeaturedRivalrySection
        playerOne={playerOne}
        playerTwo={playerTwo}
      />

      <Section
        eyebrow="Rankings"
        title="Top scorers"
        description="Career goals leaders from our player database."
      >
        <RankingTable entries={topScorers} metricLabel="Goals" />
        <div className="mt-6">
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/rankings">All rankings</Link>
          </Button>
        </div>
      </Section>

      <PredictionsSection nextPath="/#predict" compact />

      <Section
        eyebrow="Platform"
        title="Built for football discovery"
        description="Search-first stats with comparisons, charts, and community features."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <GlassCard key={card.title} className="p-5" hover>
              <h3 className="font-display text-lg font-bold text-foreground">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-foreground/60">{card.body}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="FAQ"
        title="Quick answers"
        description="How FootIndex works, where data comes from, and how to explore players."
      >
        <div className="grid gap-4">
          {HOME_FAQ.map((item) => (
            <GlassCard key={item.question} className="p-5" as="article">
              <h3 className="font-display text-lg font-bold text-foreground">
                {item.question}
              </h3>
              <p className="mt-2 text-sm text-foreground/60">{item.answer}</p>
            </GlassCard>
          ))}
        </div>
      </Section>
    </>
  );
}
