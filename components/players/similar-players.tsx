import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { listSimilarPlayers } from "@/services/players/similar-players.service";

interface SimilarPlayersProps {
  currentSlug: string;
  limit?: number;
}

export async function SimilarPlayers({
  currentSlug,
  limit = 6,
}: SimilarPlayersProps) {
  const players = await listSimilarPlayers(currentSlug, limit);

  if (players.length === 0) {
    return null;
  }

  return (
    <Section
      eyebrow="Recommendations"
      title="Similar players"
      description="Matched by position, nationality, competition, age, and scoring profile."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <li
            key={player.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-3">
              {player.imageUrl ? (
                <Image
                  src={player.imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm text-white/60">
                  {player.shortName.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0">
                <Link
                  href={player.href}
                  className="truncate font-medium text-white hover:text-brand"
                >
                  {player.name}
                </Link>
                <p className="text-xs text-white/50">
                  {player.positionLabel}
                  {player.clubName ? ` · ${player.clubName}` : ""}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/55">
              {player.careerGoals > 0 ? `${player.careerGoals} career goals` : player.nationality}
              {player.competition ? ` · ${player.competition}` : ""}
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-4 border-white/15 bg-transparent text-white hover:bg-white/10"
            >
              <Link href={player.compareHref}>Compare stats</Link>
            </Button>
          </li>
        ))}
      </ul>
    </Section>
  );
}
