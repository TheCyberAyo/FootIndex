import Link from "next/link";

import { Section } from "@/components/shared/section";
import { compareCanonicalPath } from "@/lib/compare/paths";
import { playerPath } from "@/lib/players/paths";
import { listPlayers } from "@/services";

interface RelatedPlayersProps {
  currentSlug: string;
  limit?: number;
}

/**
 * Internal linking to other players and comparisons (PROJECT_SPECIFICATION §90, §92).
 */
export async function RelatedPlayers({
  currentSlug,
  limit = 6,
}: RelatedPlayersProps) {
  const players = await listPlayers();
  const others = players.filter((player) => player.slug !== currentSlug);

  if (others.length === 0) {
    return null;
  }

  const featured = others.slice(0, limit);

  return (
    <Section
      eyebrow="Explore"
      title="Compare with other players"
      description="Discover head-to-head stats and career profiles across our player database."
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
