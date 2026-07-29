import Link from "next/link";

import { HomeChartsSection } from "@/components/charts/home-charts-section";
import { CareerComparePreview } from "@/components/home/career-compare-preview";
import { HomeHero } from "@/components/home/home-hero";
import { LiveScoresSectionClient } from "@/components/home/live-scores-section-client";
import { PredictionsSection } from "@/components/predictions/predictions-section";
import { GlassCard } from "@/components/shared/glass-card";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { VoteSection } from "@/components/votes/vote-section";
import { SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  HOME_FAQ,
} from "@/lib/seo/json-ld";
import {
  getComparisonProfiles,
  listLiveScoreCards,
} from "@/services";
import { RECENT_MATCHES_PER_PLAYER } from "@/lib/api-football/constants";

export const metadata = createPageMetadata({
  title: SITE_NAME,
  description:
    "Haaland vs Mbappé career comparison — Erling Haaland and Kylian Mbappé club and country goals, Champions League stats, trophies, awards, and season-by-season head-to-head.",
  path: "/",
});

export const revalidate = 60;

const FEATURE_CARDS = [
  {
    title: "Career Goals",
    body: "Club and international tallies, side by side.",
  },
  {
    title: "Assists & Minutes",
    body: "Creation and workload, not just finishing.",
  },
  {
    title: "Goals Per Game",
    body: "Efficiency metrics that cut through noise.",
  },
  {
    title: "Champions League",
    body: "Europe’s biggest stage, tracked cleanly.",
  },
  {
    title: "Trophies & Awards",
    body: "Silverware and individual recognition.",
  },
  {
    title: "Charts",
    body: "Radar, bar, pie, and season lines — live on Compare.",
  },
] as const;

export default async function HomePage() {
  const [{ haaland, mbappe }, liveCards] = await Promise.all([
    getComparisonProfiles(),
    listLiveScoreCards(),
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
      <HomeHero />

      <Section
        eyebrow="Recent appearances"
        title="Last matches played"
        description={`Only fixtures Haaland and Mbappé played in — most recent ${RECENT_MATCHES_PER_PLAYER} each. Cards refresh while a match is live.`}
      >
        <LiveScoresSectionClient
          initialCards={liveCards}
          initialHasLive={initialHasLive}
        />
      </Section>

      <Section
        eyebrow="Career comparison"
        title="Numbers that fuel the debate"
        description="Career rollups update when you run /api/sync (players job). Until then, seed or last sync wins."
      >
        <CareerComparePreview haaland={haaland} mbappe={mbappe} />
      </Section>

      <HomeChartsSection haaland={haaland} mbappe={mbappe} />

      <VoteSection nextPath="/#vote" />
      <PredictionsSection nextPath="/#predict" compact />

      <Section
        eyebrow="Home features"
        title="Built for the debate"
        description="Charts, voting, predictions, and comments are live."
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

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Link href="/haaland">Haaland</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/mbappe">Mbappé</Link>
          </Button>
          <Button asChild variant="ghost" className="text-white hover:bg-white/10">
            <Link href="/stats">Latest Stats</Link>
          </Button>
        </div>
      </Section>

      <Section
        eyebrow="FAQ"
        title="Quick answers"
        description="The rivalry, the data sources, and how engagement works."
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
