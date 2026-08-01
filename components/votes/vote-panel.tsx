"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VoteChoice } from "@/types/database";
import type { VoteBundle } from "@/types/domain";

const PENDING_VOTE_KEY = "pendingVoteChoice";

interface VotePanelProps {
  initialBundle: VoteBundle;
  nextPath?: string;
}

async function fetchVotes(): Promise<VoteBundle> {
  const response = await fetch("/api/votes", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load votes");
  }
  return (await response.json()) as VoteBundle;
}

async function postVote(choice: VoteChoice): Promise<VoteBundle> {
  const response = await fetch("/api/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ choice }),
  });

  const payload = (await response.json()) as VoteBundle & {
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

function tallyFor(bundle: VoteBundle, choice: VoteChoice) {
  return (
    bundle.tallies.find((item) => item.choice === choice) ?? {
      choice,
      voteCount: 0,
      votePercentage: 0,
    }
  );
}

export function VotePanel({
  initialBundle,
  nextPath = "/compare#vote",
}: VotePanelProps) {
  const queryClient = useQueryClient();
  const pendingCastRef = useRef(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<VoteChoice | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: bundle = initialBundle } = useQuery({
    queryKey: ["votes"],
    queryFn: fetchVotes,
    initialData: initialBundle,
    refetchOnMount: "always",
    refetchInterval: 30_000,
  });

  const mutation = useMutation({
    mutationFn: postVote,
    onSuccess: (next) => {
      queryClient.setQueryData(["votes"], next);
      setLocalError(null);
      setPendingChoice(null);
      sessionStorage.removeItem(PENDING_VOTE_KEY);
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

    const stored = sessionStorage.getItem(PENDING_VOTE_KEY);
    if (stored !== "haaland" && stored !== "mbappe") {
      return;
    }

    if (bundle.userVote === stored) {
      sessionStorage.removeItem(PENDING_VOTE_KEY);
      return;
    }

    pendingCastRef.current = true;
    setPendingChoice(stored);
    mutation.mutate(stored, {
      onSettled: () => {
        pendingCastRef.current = false;
      },
    });
    // Intentionally depends on auth/userVote only — avoid re-firing on mutation identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle.isAuthenticated, bundle.userVote]);

  function handleVote(choice: VoteChoice) {
    setLocalError(null);
    setPendingChoice(choice);

    if (!bundle.isAuthenticated) {
      sessionStorage.setItem(PENDING_VOTE_KEY, choice);
      setAuthOpen(true);
      return;
    }

    mutation.mutate(choice);
  }

  const haaland = tallyFor(bundle, "haaland");
  const mbappe = tallyFor(bundle, "mbappe");

  return (
    <>
      <div className="grid gap-4">
        <GlassCard className="grid gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-6">
          <VoteChoiceCard
            choice="haaland"
            label="Haaland"
            subtitle="The Viking"
            percentage={haaland.votePercentage}
            count={haaland.voteCount}
            selected={bundle.userVote === "haaland"}
            busy={mutation.isPending && pendingChoice === "haaland"}
            onSelect={() => handleVote("haaland")}
          />
          <VoteChoiceCard
            choice="mbappe"
            label="Mbappé"
            subtitle="The Speedster"
            percentage={mbappe.votePercentage}
            count={mbappe.voteCount}
            selected={bundle.userVote === "mbappe"}
            busy={mutation.isPending && pendingChoice === "mbappe"}
            onSelect={() => handleVote("mbappe")}
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
            {bundle.userVote ? (
              <p className="text-sm text-brand">
                Your vote:{" "}
                {bundle.userVote === "haaland" ? "Haaland" : "Mbappé"}
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
              label="Haaland"
              percentage={haaland.votePercentage}
              count={haaland.voteCount}
              barClassName="bg-white"
            />
            <LeaderBar
              label="Mbappé"
              percentage={mbappe.votePercentage}
              count={mbappe.voteCount}
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
          setPendingChoice(null);
        }}
        nextPath={nextPath}
        intent="vote"
      />
    </>
  );
}

interface VoteChoiceCardProps {
  choice: VoteChoice;
  label: string;
  subtitle: string;
  percentage: number;
  count: number;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  accent?: boolean;
}

function VoteChoiceCard({
  label,
  subtitle,
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
      <p className="text-xs tracking-[0.18em] text-foreground/40 uppercase">
        {subtitle}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-3xl font-extrabold",
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
