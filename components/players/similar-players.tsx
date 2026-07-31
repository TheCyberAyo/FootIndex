import { SimilarPlayerCard } from "@/components/players/similar-player-card";
import { Section } from "@/components/shared/section";
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
          <SimilarPlayerCard key={player.id} player={player} />
        ))}
      </ul>
    </Section>
  );
}
