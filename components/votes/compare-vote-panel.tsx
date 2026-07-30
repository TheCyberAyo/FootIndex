"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompareVoteBundle } from "@/services/votes/comparison-votes.service";

function pendingVoteKey(playerOneSlug: string, playerTwoSlug: string): string {
  return `pendingCompareVote:${playerOneSlug}:${playerTwoSlug}`;
}

interface CompareVotePanelProps {
  playerOneSlug: string;
  playerTwoSlug: string;
  playerOneName: string;
  playerTwoName: string;
  initialBundle: CompareVoteBundle;
  nextPath?: string;
}

async function fetchCompareVotes(
  playerOneSlug: string,
  playerTwoSlug: string,
): Promise<CompareVoteBundle> {
  const params = new URLSearchParams({ playerOne: playerOneSlug, playerTwo: playerTwoSlug });
  const response = await fetch(`/api/votes/compare?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to load votes");
  }
  return (await response.json()) as CompareVoteBundle;
}

async function postCompareVote(input: {
  playerOneSlug: string;
  playerTwoSlug: string;
  choiceSlug: string;
}): Promise<CompareVoteBundle> {
  const response = await fetch("/api/votes/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as CompareVoteBundle & {
    error?: string;
    code?: string;
  };

  if (!response.ok) {
    const error = new Error(payload.error ?? "Failed to save vote") as Error & {
      code?: string;
    };
    error.code = payload.code;
    throw error;
  }

  return payload;
}

export function CompareVotePanel({
  playerOneSlug,
  playerTwoSlug,
  playerOneName,
  playerTwoName,
  initialBundle,
  nextPath = "/compare#vote",
}: CompareVotePanelProps) {
  const queryClient = useQueryClient();
  const pendingCastRef = useRef(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingChoiceSlug, setPendingChoiceSlug] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const queryKey = ["compare-votes", playerOneSlug, playerTwoSlug];

  const { data: bundle = initialBundle } = useQuery({
    queryKey,
    queryFn: () => fetchCompareVotes(playerOneSlug, playerTwoSlug),
    initialData: initialBundle,
    refetchOnMount: "always",
    refetchInterval: 30_000,
  });

  const mutation = useMutation({
    mutationFn: (choiceSlug: string) =>
      postCompareVote({ playerOneSlug, playerTwoSlug, choiceSlug }),
    onSuccess: (next) => {
      queryClient.setQueryData(queryKey, next);
      setLocalError(null);
      setPendingChoiceSlug(null);
      sessionStorage.removeItem(pendingVoteKey(playerOneSlug, playerTwoSlug));
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === "AUTH_REQUIRED") {
        setAuthOpen(true);
        return;
      }
      setLocalError(error.message);
    },
  });

  useEffect(() => {
    if (!bundle.isAuthenticated || pendingCastRef.current) {
      return;
    }

    const stored = sessionStorage.getItem(
      pendingVoteKey(playerOneSlug, playerTwoSlug),
    );
    if (stored !== playerOneSlug && stored !== playerTwoSlug) {
      return;
    }

    const storedPlayerId =
      stored === playerOneSlug
        ? bundle.playerOne.playerId
        : bundle.playerTwo.playerId;

    if (bundle.userChoicePlayerId === storedPlayerId) {
      sessionStorage.removeItem(pendingVoteKey(playerOneSlug, playerTwoSlug));
      return;
    }

    pendingCastRef.current = true;
    setPendingChoiceSlug(stored);
    mutation.mutate(stored, {
      onSettled: () => {
        pendingCastRef.current = false;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle.isAuthenticated, bundle.userChoicePlayerId]);

  function handleVote(choiceSlug: string) {
    setLocalError(null);
    setPendingChoiceSlug(choiceSlug);

    if (!bundle.isAuthenticated) {
      sessionStorage.setItem(
        pendingVoteKey(playerOneSlug, playerTwoSlug),
        choiceSlug,
      );
      setAuthOpen(true);
      return;
    }

    mutation.mutate(choiceSlug);
  }

  const userChoiceSlug =
    bundle.userChoicePlayerId === bundle.playerOne.playerId
      ? playerOneSlug
      : bundle.userChoicePlayerId === bundle.playerTwo.playerId
        ? playerTwoSlug
        : null;

  return (
    <>
      <div className="grid gap-4">
        <GlassCard className="grid gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-6">
          <VoteChoiceCard
            label={playerOneName}
            percentage={bundle.playerOne.votePercentage}
            count={bundle.playerOne.voteCount}
            selected={userChoiceSlug === playerOneSlug}
            busy={mutation.isPending && pendingChoiceSlug === playerOneSlug}
            onSelect={() => handleVote(playerOneSlug)}
          />
          <VoteChoiceCard
            label={playerTwoName}
            percentage={bundle.playerTwo.votePercentage}
            count={bundle.playerTwo.voteCount}
            selected={userChoiceSlug === playerTwoSlug}
            busy={mutation.isPending && pendingChoiceSlug === playerTwoSlug}
            onSelect={() => handleVote(playerTwoSlug)}
            accent
          />
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs tracking-[0.18em] text-foreground/40 uppercase">
                Leaderboard
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                {bundle.totalVotes.toLocaleString("en-US")} total vote
                {bundle.totalVotes === 1 ? "" : "s"}
              </p>
            </div>
            {userChoiceSlug ? (
              <p className="text-sm text-brand">
                Your vote:{" "}
                {userChoiceSlug === playerOneSlug ? playerOneName : playerTwoName}
              </p>
            ) : (
              <p className="text-sm text-foreground/45">
                {bundle.isAuthenticated
                  ? "Pick a side — you can change later."
                  : "Sign in to cast your vote."}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            <LeaderBar
              label={playerOneName}
              percentage={bundle.playerOne.votePercentage}
              count={bundle.playerOne.voteCount}
              barClassName="bg-white"
            />
            <LeaderBar
              label={playerTwoName}
              percentage={bundle.playerTwo.votePercentage}
              count={bundle.playerTwo.voteCount}
              barClassName="bg-brand"
            />
          </div>

          {!bundle.isAuthenticated ? (
            <div className="mt-5">
              <Button
                type="button"
                onClick={() => setAuthOpen(true)}
                variant="brand"
              >
                Sign in to vote
              </Button>
            </div>
          ) : null}

          {localError ? (
            <p className="mt-3 text-sm text-red-400">{localError}</p>
          ) : null}
        </GlassCard>
      </div>

      <AuthDialog
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingChoiceSlug(null);
        }}
        nextPath={nextPath}
      />
    </>
  );
}

interface VoteChoiceCardProps {
  label: string;
  percentage: number;
  count: number;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  accent?: boolean;
}

function VoteChoiceCard({
  label,
  percentage,
  count,
  selected,
  busy,
  onSelect,
  accent = false,
}: VoteChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={busy}
      className={cn(
        "rounded-2xl border px-4 py-5 text-left transition-colors",
        selected
          ? "border-brand bg-brand/10"
          : "border-glass-border bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]",
      )}
    >
      <p
        className={cn(
          "font-display text-3xl font-extrabold",
          accent || selected ? "text-brand" : "text-foreground",
        )}
      >
        {label}
      </p>
      <p className="mt-3 text-sm text-foreground/55">
        {percentage.toFixed(1)}% · {count.toLocaleString("en-US")} votes
      </p>
      <p className="mt-4 text-sm font-medium text-foreground/80">
        {busy ? "Saving…" : selected ? "Your pick" : "Vote"}
      </p>
    </button>
  );
}

interface LeaderBarProps {
  label: string;
  percentage: number;
  count: number;
  barClassName: string;
}

function LeaderBar({
  label,
  percentage,
  count,
  barClassName,
}: LeaderBarProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-foreground/80">{label}</span>
        <span className="text-foreground/50">
          {percentage.toFixed(1)}% · {count}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all", barClassName)}
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
