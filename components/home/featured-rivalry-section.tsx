import Link from "next/link";

import { HomeChartsSection } from "@/components/charts/home-charts-section";
import { CareerComparePreview } from "@/components/home/career-compare-preview";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { VoteSection } from "@/components/votes/vote-section";
import {
  FEATURED_RIVALRY,
  featuredComparePath,
} from "@/lib/brand/featured-rivalry";
import type { PlayerProfile } from "@/types/domain";

interface FeaturedRivalrySectionProps {
  playerOne: PlayerProfile;
  playerTwo: PlayerProfile;
}

export function FeaturedRivalrySection({
  playerOne,
  playerTwo,
}: FeaturedRivalrySectionProps) {
  return (
    <>
      <Section
        eyebrow="Featured comparison"
        title={FEATURED_RIVALRY.title}
        description={FEATURED_RIVALRY.description}
      >
        <CareerComparePreview haaland={playerOne} mbappe={playerTwo} />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            variant="brand"
          >
            <Link href={featuredComparePath()}>Full comparison</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <Link href={`${featuredComparePath()}#vote`}>Vote</Link>
          </Button>
        </div>
      </Section>

      <HomeChartsSection haaland={playerOne} mbappe={playerTwo} />
      <VoteSection nextPath="/#vote" />
    </>
  );
}
