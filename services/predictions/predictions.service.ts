import { getAuthUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoError, ServiceError } from "@/services/errors";
import { listUpcomingMatches } from "@/services/matches/matches.service";
import { ensureUserProfile } from "@/services/users/ensure-profile";
import type { PredictionRow } from "@/types/database";
import type { Match, PredictionSummary } from "@/types/domain";

interface PredictionInput {
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedScorerPlayerId?: string | null;
}

function emptySummaries(matches: Match[]): PredictionSummary[] {
  return matches.map((match) => ({
    match,
    predictionCount: 0,
    avgHomeScore: null,
    avgAwayScore: null,
    userPrediction: null,
  }));
}

function buildSummaries(
  matches: Match[],
  predictions: PredictionRow[],
  userId: string | null,
): PredictionSummary[] {
  return matches.map((match) => {
    const forMatch = predictions.filter((row) => row.match_id === match.id);
    const userRow = userId
      ? (forMatch.find((row) => row.user_id === userId) ?? null)
      : null;

    const count = forMatch.length;
    const avgHome =
      count === 0
        ? null
        : forMatch.reduce((sum, row) => sum + row.predicted_home_score, 0) /
          count;
    const avgAway =
      count === 0
        ? null
        : forMatch.reduce((sum, row) => sum + row.predicted_away_score, 0) /
          count;

    return {
      match,
      predictionCount: count,
      avgHomeScore: avgHome === null ? null : Math.round(avgHome * 10) / 10,
      avgAwayScore: avgAway === null ? null : Math.round(avgAway * 10) / 10,
      userPrediction: userRow
        ? {
            id: userRow.id,
            predictedHomeScore: userRow.predicted_home_score,
            predictedAwayScore: userRow.predicted_away_score,
            predictedScorerPlayerId: userRow.predicted_scorer_player_id,
          }
        : null,
    };
  });
}

/** Public aggregates only — safe for ISR (no cookies). */
export async function listPublicPredictionSummaries(): Promise<
  PredictionSummary[]
> {
  const matches = await listUpcomingMatches(8);

  if (!isSupabaseConfigured() || matches.length === 0) {
    return emptySummaries(matches);
  }

  try {
    const supabase = createSupabasePublicClient();
    const result = await supabase
      .from("predictions")
      .select("*")
      .in(
        "match_id",
        matches.map((match) => match.id),
      );

    assertNoError(result.error, "Failed to load predictions");
    return buildSummaries(matches, (result.data ?? []) as PredictionRow[], null);
  } catch {
    return emptySummaries(matches);
  }
}

export async function listPredictionSummaries(): Promise<{
  summaries: PredictionSummary[];
  isAuthenticated: boolean;
}> {
  const user = await getAuthUser();
  const matches = await listUpcomingMatches(8);

  if (!isSupabaseConfigured() || matches.length === 0) {
    return {
      summaries: emptySummaries(matches),
      isAuthenticated: Boolean(user),
    };
  }

  try {
    const supabase = createSupabasePublicClient();
    const result = await supabase
      .from("predictions")
      .select("*")
      .in(
        "match_id",
        matches.map((match) => match.id),
      );

    assertNoError(result.error, "Failed to load predictions");

    return {
      summaries: buildSummaries(
        matches,
        (result.data ?? []) as PredictionRow[],
        user?.id ?? null,
      ),
      isAuthenticated: Boolean(user),
    };
  } catch {
    return {
      summaries: emptySummaries(matches),
      isAuthenticated: Boolean(user),
    };
  }
}

export async function upsertPrediction(
  input: PredictionInput,
): Promise<PredictionSummary[]> {
  if (!isSupabaseConfigured()) {
    throw new ServiceError(
      "Predictions require Supabase configuration.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  if (
    !Number.isInteger(input.predictedHomeScore) ||
    !Number.isInteger(input.predictedAwayScore) ||
    input.predictedHomeScore < 0 ||
    input.predictedAwayScore < 0 ||
    input.predictedHomeScore > 20 ||
    input.predictedAwayScore > 20
  ) {
    throw new ServiceError("Scores must be integers from 0–20.", "INVALID_SCORE");
  }

  const user = await getAuthUser();
  if (!user) {
    throw new ServiceError("Sign in to submit a prediction.", "AUTH_REQUIRED");
  }

  await ensureUserProfile(user.id, user.email ?? null);

  const supabase = await createSupabaseServerClient();
  const result = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      match_id: input.matchId,
      predicted_home_score: input.predictedHomeScore,
      predicted_away_score: input.predictedAwayScore,
      predicted_scorer_player_id: input.predictedScorerPlayerId ?? null,
    },
    { onConflict: "user_id,match_id" },
  );

  assertNoError(result.error, "Failed to save prediction");

  const bundle = await listPredictionSummaries();
  return bundle.summaries;
}
