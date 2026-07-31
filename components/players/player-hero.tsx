import Link from "next/link";
import Image from "next/image";

import { ShareActions } from "@/components/shared/share-actions";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { teamPath } from "@/lib/teams/paths";
import { absoluteUrl } from "@/lib/seo/routes";
import { playerPath } from "@/lib/players/paths";
import {
  formatHeight,
  formatPosition,
  getPlayerAge,
} from "@/lib/players/format";
import type { PlayerProfile } from "@/types/domain";

interface PlayerHeroProps {
  profile: PlayerProfile;
  compareHref?: string;
}

/**
 * Full-bleed player hero.
 * Decision: photo as dominant plane when available; glass strip for identity
 * only (no floating badges/stat chips in the hero).
 */
export function PlayerHero({ profile, compareHref }: PlayerHeroProps) {
  const { player } = profile;
  const age = getPlayerAge(player.date_of_birth);
  const club = player.current_team?.name ?? "Free agent";
  const clubLogo = player.current_team?.logo_url;

  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden border-b border-white/10 sm:min-h-[78vh]">
      {player.image_url ? (
        <Image
          src={player.image_url}
          alt={player.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-80 sm:object-[center_20%]"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,197,24,0.18),_transparent_50%),linear-gradient(180deg,#0a0a0a,#000)]"
        />
      )}

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/30"
      />

      <Container className="relative z-10 flex min-h-[70vh] flex-col justify-end py-12 sm:min-h-[78vh] sm:py-16">
        <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-brand uppercase">
          Player profile
        </p>
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)] sm:text-7xl lg:text-8xl">
          {player.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/75 sm:text-lg">
          {formatPosition(player.position)} · {player.nationality} · Age {age} ·{" "}
          {formatHeight(player.height_cm)}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
          {clubLogo ? (
            <Image
              src={clubLogo}
              alt={`${club} crest`}
              width={40}
              height={40}
              className="size-10 object-contain"
            />
          ) : null}
          <div>
            <p className="text-xs tracking-wide text-white/40 uppercase">
              Current club
            </p>
            {player.current_team?.slug ? (
              <Link
                href={teamPath(player.current_team.slug)}
                className="font-medium text-white hover:text-brand"
              >
                {club}
              </Link>
            ) : (
              <p className="font-medium text-white">{club}</p>
            )}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <FavoriteButton entityType="player" playerId={player.id} />
            {compareHref ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/20 bg-black/30 text-white hover:bg-white/10"
              >
                <Link href={compareHref}>Compare</Link>
              </Button>
            ) : null}
            <ShareActions
              url={absoluteUrl(playerPath(player.slug))}
              title={`${player.name} career stats`}
              text={`${player.name} — career goals, assists, trophies, and season stats on FootIndex.`}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
