import { Container } from "@/components/shared/container";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Beautiful loading skeleton shared by route loading.tsx files.
 * Matches glass layout so perceived performance feels premium (CLS-safe).
 */
export function PageSkeleton() {
  return (
    <div className="min-h-[60vh]" aria-busy="true" aria-live="polite">
      <div className="border-b border-white/10 bg-surface-elevated/60">
        <Container className="py-14 sm:py-20">
          <Skeleton className="mb-4 h-3 w-24 bg-white/10" />
          <Skeleton className="h-12 w-full max-w-md bg-white/10 sm:h-14" />
          <Skeleton className="mt-4 h-5 w-full max-w-xl bg-white/10" />
          <Skeleton className="mt-2 h-5 w-2/3 max-w-lg bg-white/10" />
        </Container>
      </div>

      <Container className="grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <GlassCard key={index} className="p-5">
            <Skeleton className="mb-4 h-4 w-20 bg-white/10" />
            <Skeleton className="mb-2 h-8 w-24 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
          </GlassCard>
        ))}
      </Container>
    </div>
  );
}
