import { Heart, MessageSquare, Sparkles, Trophy } from "lucide-react";

import { GlassCard } from "@/components/shared/glass-card";

const BENEFITS = [
  {
    icon: Trophy,
    title: "Vote on comparisons",
    body: "Pick a side in head-to-head matchups. One vote per account, change anytime.",
  },
  {
    icon: Heart,
    title: "Save favorites",
    body: "Bookmark players, teams, and comparisons for quick access from your account.",
  },
  {
    icon: MessageSquare,
    title: "Comment & discuss",
    body: "Join threads on player profiles and compare pages.",
  },
  {
    icon: Sparkles,
    title: "Submit predictions",
    body: "Track fixture picks and revisit them after results land.",
  },
] as const;

export function AuthBenefits() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      {BENEFITS.map((benefit) => (
        <GlassCard key={benefit.title} className="p-4 sm:p-5">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <benefit.icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                {benefit.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {benefit.body}
              </p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
