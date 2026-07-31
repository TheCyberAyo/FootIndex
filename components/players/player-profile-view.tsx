import Link from "next/link";

import { PlayerChartsSection } from "@/components/charts/player-charts-section";
import { CommentsSection } from "@/components/comments/comments-section";
import { PlayerAchievements } from "@/components/players/player-achievements";
import { PlayerBio } from "@/components/players/player-bio";
import { PlayerClubHistory } from "@/components/players/player-club-history";
import { PlayerHero } from "@/components/players/player-hero";
import { PlayerInternationalCareer } from "@/components/players/player-international-career";
import { PlayerRecords } from "@/components/players/player-records";
import { PlayerSeasonTable } from "@/components/players/player-season-table";
import { PlayerStatsGrid } from "@/components/players/player-stats-grid";
import { PlayerTimeline } from "@/components/players/player-timeline";
import { PlayerVideosPlaceholder } from "@/components/players/player-videos-placeholder";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { compareCanonicalPath, defaultComparePath } from "@/lib/compare";
import { playerPath } from "@/lib/players/paths";
import { buildCareerTimeline } from "@/lib/players/timeline";
import type { PlayerProfile } from "@/types/domain";

interface PlayerProfileViewProps {
  profile: PlayerProfile;
  rival?: PlayerProfile | null;
  compareHref?: string;
}

/**
 * Full player page composition — charts are the only client islands.
 */
export function PlayerProfileView({
  profile,
  rival,
  compareHref,
}: PlayerProfileViewProps) {
  const resolvedCompareHref =
    compareHref ??
    (rival
      ? compareCanonicalPath(profile.player.slug, rival.player.slug)
      : defaultComparePath());
  const timeline = buildCareerTimeline({
    trophies: profile.trophies,
    awards: profile.awards,
    seasons: profile.seasons,
    transfers: profile.transfers,
  });

  return (
    <>
      <PlayerHero profile={profile} compareHref={resolvedCompareHref} />
      <PlayerBio profile={profile} />
      <PlayerStatsGrid career={profile.career} />
      <PlayerClubHistory
        seasons={profile.seasons}
        trophies={profile.trophies}
      />
      <PlayerInternationalCareer
        seasons={profile.seasons}
        nationality={profile.player.nationality}
      />
      <PlayerSeasonTable seasons={profile.seasons} />
      <PlayerAchievements
        trophies={profile.trophies}
        awards={profile.awards}
      />
      <PlayerRecords
        player={profile.player}
        career={profile.career}
        seasons={profile.seasons}
      />
      <PlayerTimeline events={timeline} />
      <PlayerChartsSection profile={profile} rival={rival ?? undefined} />
      <PlayerVideosPlaceholder playerName={profile.player.name} />
      <CommentsSection
        entityType="player"
        entityId={profile.player.slug}
        nextPath={`${playerPath(profile.player.slug)}#comments`}
        title={`Talk ${profile.player.short_name}`}
      />

      <Section title="Keep exploring">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            variant="brand"
          >
            <Link href={resolvedCompareHref}>Compare Players</Link>
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
