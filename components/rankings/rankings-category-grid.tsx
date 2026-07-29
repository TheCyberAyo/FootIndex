import Link from "next/link";

import { GlassCard } from "@/components/shared/glass-card";
import { RANKING_CATEGORIES } from "@/lib/rankings/categories";

export function RankingsCategoryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {RANKING_CATEGORIES.map((category) => (
        <GlassCard key={category.slug} className="p-5" hover>
          <Link href={`/rankings/${category.slug}`} className="block">
            <h2 className="font-display text-lg font-bold text-foreground">
              {category.title}
            </h2>
            <p className="mt-2 text-sm text-foreground/60">
              {category.description}
            </p>
            <p className="mt-4 text-sm font-medium text-brand">
              View ranking →
            </p>
          </Link>
        </GlassCard>
      ))}
    </div>
  );
}
