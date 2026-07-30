import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlayerSearchResult } from "@/types/domain";

interface PlayerSearchResultItemProps {
  result: PlayerSearchResult;
  active?: boolean;
  onSelect?: () => void;
  onPick?: (result: PlayerSearchResult) => void;
  className?: string;
}

/**
 * Search result card — PROJECT_SPECIFICATION §56.
 */
export function PlayerSearchResultItem({
  result,
  active = false,
  onSelect,
  onPick,
  className,
}: PlayerSearchResultItemProps) {
  const content = (
    <>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10">
        {result.imageUrl ? (
          <Image
            src={result.imageUrl}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground/60">
            {result.shortName.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{result.name}</p>
        <p className="truncate text-sm text-foreground/60">
          {[result.clubName, result.nationality, result.competition]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <Badge variant="outline" className="border-white/15 text-foreground/70">
          {result.positionLabel}
        </Badge>
        <span className="text-xs text-foreground/50">Age {result.age}</span>
      </div>
    </>
  );

  const itemClassName = cn(
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
    active
      ? "bg-brand/15 text-foreground"
      : "text-foreground/90 hover:bg-white/5",
    className,
  );

  if (onPick) {
    return (
      <button
        type="button"
        onClick={() => {
          onPick(result);
          onSelect?.();
        }}
        className={itemClassName}
        role="option"
        aria-selected={active}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={result.href}
      onClick={onSelect}
      className={itemClassName}
      role="option"
      aria-selected={active}
    >
      {content}
    </Link>
  );
}

interface PlayerSearchResultsListProps {
  results: PlayerSearchResult[];
  activeIndex?: number;
  onSelect?: () => void;
  onPick?: (result: PlayerSearchResult) => void;
  emptyMessage?: string;
  className?: string;
}

export function PlayerSearchResultsList({
  results,
  activeIndex = -1,
  onSelect,
  onPick,
  emptyMessage = "No players found.",
  className,
}: PlayerSearchResultsListProps) {
  if (results.length === 0) {
    return (
      <p className={cn("px-3 py-4 text-sm text-foreground/60", className)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className={cn("divide-y divide-white/5", className)} role="listbox">
      {results.map((result, index) => (
        <li key={result.id}>
          <PlayerSearchResultItem
            result={result}
            active={index === activeIndex}
            onSelect={onSelect}
            onPick={onPick}
          />
        </li>
      ))}
    </ul>
  );
}
