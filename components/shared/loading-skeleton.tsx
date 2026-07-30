import { Container } from "@/components/shared/container";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading skeleton (spec §190).
 */
export function LoadingSkeleton() {
  return (
    <div className="min-h-[60vh]" aria-busy="true" aria-live="polite">
      <div className="border-b border-border/60 bg-surface-raised/60">
        <Container className="py-14 sm:py-20">
          <Skeleton className="mb-4 h-3 w-24" />
          <Skeleton className="h-12 w-full max-w-md sm:h-14" />
          <Skeleton className="mt-4 h-5 w-full max-w-xl" />
          <Skeleton className="mt-2 h-5 w-2/3 max-w-lg" />
        </Container>
      </div>

      <Container className="grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <GlassCard key={index} className="p-5">
            <Skeleton className="mb-4 h-4 w-20" />
            <Skeleton className="mb-2 h-8 w-24" />
            <Skeleton className="h-4 w-full" />
          </GlassCard>
        ))}
      </Container>
    </div>
  );
}

/** @deprecated Use LoadingSkeleton */
export const PageSkeleton = LoadingSkeleton;
