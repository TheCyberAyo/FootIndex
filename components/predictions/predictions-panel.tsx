"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { SEED_PLAYER_IDS } from "@/lib/data/seed-ids";
import { cn } from "@/lib/utils";
import type { PredictionSummary } from "@/types/domain";

interface PredictionsPanelProps {
  initialSummaries: PredictionSummary[];
  nextPath?: string;
}

interface PredictionsResponse {
  summaries: PredictionSummary[];
  isAuthenticated: boolean;
}

async function fetchPredictions(): Promise<PredictionsResponse> {
  const response = await fetch("/api/predictions", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load predictions");
  }
  return (await response.json()) as PredictionsResponse;
}

export function PredictionsPanel({
  initialSummaries,
  nextPath = "/predict",
}: PredictionsPanelProps) {
  const queryClient = useQueryClient();
  const [authOpen, setAuthOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["predictions"],
    queryFn: fetchPredictions,
    initialData: {
      summaries: initialSummaries,
      isAuthenticated: false,
    },
    refetchOnMount: "always",
  });

  const mutation = useMutation({
    mutationFn: async (payload: {
      matchId: string;
      predictedHomeScore: number;
      predictedAwayScore: number;
      predictedScorerPlayerId: string | null;
    }) => {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json()) as PredictionsResponse & {
        error?: string;
        code?: string;
      };
      if (!response.ok) {
        const err = new Error(json.error ?? "Failed to save") as Error & {
          code?: string;
        };
        err.code = json.code;
        throw err;
      }
      return json;
    },
    onSuccess: (next) => {
      queryClient.setQueryData(["predictions"], next);
      setError(null);
    },
    onError: (err: Error & { code?: string }) => {
      if (err.code === "AUTH_REQUIRED") {
        setAuthOpen(true);
        return;
      }
      setError(err.message);
    },
  });

  if (data.summaries.length === 0) {
    return (
      <GlassCard className="p-6 text-sm text-foreground/55">
        No upcoming fixtures yet. Sync fixtures or reseed scheduled matches to
        unlock predictions.
      </GlassCard>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {data.summaries.map((summary) => (
          <PredictionCard
            key={summary.match.id}
            summary={summary}
            isAuthenticated={data.isAuthenticated}
            busy={mutation.isPending}
            onNeedAuth={() => setAuthOpen(true)}
            onSubmit={(payload) => mutation.mutate(payload)}
          />
        ))}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        nextPath={nextPath}
      />
    </>
  );
}

interface PredictionCardProps {
  summary: PredictionSummary;
  isAuthenticated: boolean;
  busy: boolean;
  onNeedAuth: () => void;
  onSubmit: (payload: {
    matchId: string;
    predictedHomeScore: number;
    predictedAwayScore: number;
    predictedScorerPlayerId: string | null;
  }) => void;
}

function PredictionCard({
  summary,
  isAuthenticated,
  busy,
  onNeedAuth,
  onSubmit,
}: PredictionCardProps) {
  const { match } = summary;
  const [home, setHome] = useState(
    String(summary.userPrediction?.predictedHomeScore ?? 2),
  );
  const [away, setAway] = useState(
    String(summary.userPrediction?.predictedAwayScore ?? 1),
  );
  const [scorer, setScorer] = useState(
    summary.userPrediction?.predictedScorerPlayerId ?? SEED_PLAYER_IDS.haaland,
  );

  const homeName = match.home_team?.short_name ?? "Home";
  const awayName = match.away_team?.short_name ?? "Away";

  function handleSubmit() {
    if (!isAuthenticated) {
      onNeedAuth();
      return;
    }

    onSubmit({
      matchId: match.id,
      predictedHomeScore: Number(home),
      predictedAwayScore: Number(away),
      predictedScorerPlayerId: scorer,
    });
  }

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-foreground/40 uppercase">
            {match.competition}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-foreground">
            {homeName} vs {awayName}
          </h3>
          <p className="mt-1 text-sm text-foreground/50">
            {format(new Date(match.kickoff_at), "EEE d MMM · HH:mm")} UTC
            {match.venue ? ` · ${match.venue}` : ""}
          </p>
        </div>
        <p className="text-sm text-foreground/45">
          {summary.predictionCount} prediction
          {summary.predictionCount === 1 ? "" : "s"}
          {summary.avgHomeScore != null && summary.avgAwayScore != null
            ? ` · crowd ${summary.avgHomeScore}–${summary.avgAwayScore}`
            : ""}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr_1fr] sm:items-end">
        <label className="grid gap-1 text-sm">
          <span className="text-foreground/55">{homeName}</span>
          <input
            type="number"
            min={0}
            max={20}
            value={home}
            onChange={(event) => setHome(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background/40 px-3 text-foreground outline-none ring-brand focus:ring-2"
          />
        </label>
        <p className="hidden pb-3 text-center font-display text-lg text-brand sm:block">
          –
        </p>
        <label className="grid gap-1 text-sm">
          <span className="text-foreground/55">{awayName}</span>
          <input
            type="number"
            min={0}
            max={20}
            value={away}
            onChange={(event) => setAway(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background/40 px-3 text-foreground outline-none ring-brand focus:ring-2"
          />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-1">
          <span className="text-foreground/55">First scorer</span>
          <select
            value={scorer}
            onChange={(event) => setScorer(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background/40 px-3 text-foreground outline-none ring-brand focus:ring-2"
          >
            <option value={SEED_PLAYER_IDS.haaland}>Haaland</option>
            <option value={SEED_PLAYER_IDS.mbappe}>Mbappé</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={busy}
          onClick={handleSubmit}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          {summary.userPrediction ? "Update prediction" : "Lock prediction"}
        </Button>
        {summary.userPrediction ? (
          <p className={cn("text-sm text-brand")}>
            Your tip: {summary.userPrediction.predictedHomeScore}–
            {summary.userPrediction.predictedAwayScore}
          </p>
        ) : null}
      </div>
    </GlassCard>
  );
}
