import Link from "next/link";

import { PlayerChartsSection } from "@/components/charts/player-charts-section";
import { CommentsSection } from "@/components/comments/comments-section";
import { PlayerAchievements } from "@/components/players/player-achievements";
import { PlayerBio } from "@/components/players/player-bio";
import { PlayerHero } from "@/components/players/player-hero";
import { PlayerSeasonTable } from "@/components/players/player-season-table";
import { PlayerStatsGrid } from "@/components/players/player-stats-grid";
import { PlayerTimeline } from "@/components/players/player-timeline";
import { PlayerVideosPlaceholder } from "@/components/players/player-videos-placeholder";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { buildCareerTimeline } from "@/lib/players/timeline";
import type { PlayerProfile } from "@/types/domain";

interface PlayerProfileViewProps {
  profile: PlayerProfile;
  rival: PlayerProfile;
  compareHref?: string;
}

/**
 * Full player page composition — charts are the only client islands.
 */
export function PlayerProfileView({
  profile,
  rival,
  compareHref = "/compare",
}: PlayerProfileViewProps) {
  const timeline = buildCareerTimeline({
    trophies: profile.trophies,
    awards: profile.awards,
    seasons: profile.seasons,
  });

  return (
    <>
      <PlayerHero profile={profile} />
      <PlayerBio profile={profile} />
      <PlayerStatsGrid career={profile.career} />
      <PlayerSeasonTable seasons={profile.seasons} />
      <PlayerAchievements
        trophies={profile.trophies}
        awards={profile.awards}
      />
      <PlayerTimeline events={timeline} />
      <PlayerChartsSection profile={profile} rival={rival} />
      <PlayerVideosPlaceholder playerName={profile.player.name} />
      <CommentsSection
        entityType="player"
        entityId={profile.player.slug}
        nextPath={`/${profile.player.slug}#comments`}
        title={`Talk ${profile.player.short_name}`}
      />

      <Section title="Keep exploring">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Link href={compareHref}>Compare Players</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/stats">Latest Stats</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
