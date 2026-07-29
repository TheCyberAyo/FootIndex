import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  className?: string;
}

export function ChartSkeleton({ className }: ChartSkeletonProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-end justify-between gap-2 rounded-xl bg-white/[0.03] px-4 py-6",
        className,
      )}
      aria-hidden
    >
      {[40, 65, 45, 80, 55, 70, 50].map((height, index) => (
        <div
          key={index}
          className="flex-1 animate-pulse rounded-sm bg-white/10"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
