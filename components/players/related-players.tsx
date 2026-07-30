import Link from "next/link";

import { Section } from "@/components/shared/section";
import { compareCanonicalPath } from "@/lib/compare/paths";
import { playerPath } from "@/lib/players/paths";
import { getPlayerProfileBySlug, listPlayers } from "@/services";

interface RelatedPlayersProps {
  currentSlug: string;
  limit?: number;
}

/**
 * Teammates and same-competition peers — complements SimilarPlayers scoring.
 */
export async function RelatedPlayers({
  currentSlug,
  limit = 6,
}: RelatedPlayersProps) {
  const [profile, players] = await Promise.all([
    getPlayerProfileBySlug(currentSlug),
    listPlayers(),
  ]);

  if (!profile) {
    return null;
  }

  const currentTeamId = profile.player.current_team_id;
  const competitions = new Set(profile.seasons.map((row) => row.competition));

  const scored = players
    .filter((player) => player.slug !== currentSlug)
    .map((player) => {
      let score = 0;
      if (currentTeamId && player.current_team_id === currentTeamId) {
        score += 3;
      }
      if (player.nationality === profile.player.nationality) {
        score += 1;
      }
      return { player, score };
    })
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.player.name.localeCompare(b.player.name),
    );

  const featured =
    scored.length > 0
      ? scored.slice(0, limit).map((row) => row.player)
      : players
          .filter((player) => player.slug !== currentSlug)
          .slice(0, limit);

  if (featured.length === 0) {
    return null;
  }

  return (
    <Section
      eyebrow="Explore"
      title="Related players"
      description={
        currentTeamId
          ? "Teammates and peers from the same competitions in our database."
          : "More profiles to compare across our player database."
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((player) => (
          <li
            key={player.slug}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
          >
            <Link
              href={playerPath(player.slug)}
              className="font-medium text-white hover:text-brand"
            >
              {player.name}
            </Link>
            {player.current_team ? (
              <p className="mt-1 text-sm text-white/50">
                {player.current_team.name}
                {competitions.size > 0 ? "" : ""}
              </p>
            ) : null}
            <Link
              href={compareCanonicalPath(currentSlug, player.slug)}
              className="mt-3 inline-block text-sm text-brand hover:underline"
            >
              Compare stats →
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-white/50">
        <Link href="/search" className="text-brand hover:underline">
          Search all players
        </Link>
      </p>
    </Section>
  );
}
