"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  clearRecentSearches,
  fetchRecentSearches,
  type RecentSearchEntry,
} from "@/lib/search/session";
import { playerPath } from "@/lib/players/paths";

interface RecentSearchesProps {
  onSelect: (term: string) => void;
  refreshKey?: number;
}

export function RecentSearches({ onSelect, refreshKey = 0 }: RecentSearchesProps) {
  const [entries, setEntries] = useState<RecentSearchEntry[]>([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    function loadEntries() {
      void fetchRecentSearches(6).then(setEntries);
    }

    loadEntries();

    window.addEventListener("search-history-updated", loadEntries);
    return () => {
      window.removeEventListener("search-history-updated", loadEntries);
    };
  }, [refreshKey]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Recent searches</p>
        <button
          type="button"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          disabled={clearing}
          onClick={() => {
            setClearing(true);
            void clearRecentSearches().finally(() => setClearing(false));
          }}
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <RecentSearchChip key={entry.id} entry={entry} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function RecentSearchChip({
  entry,
  onSelect,
}: {
  entry: RecentSearchEntry;
  onSelect: (term: string) => void;
}) {
  const chipClassName =
    "rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-brand/40";

  if (entry.playerSlug && entry.playerName) {
    return (
      <Link href={playerPath(entry.playerSlug)} className={chipClassName}>
        {entry.playerName}
      </Link>
    );
  }

  return (
    <button type="button" className={chipClassName} onClick={() => onSelect(entry.searchTerm)}>
      {entry.searchTerm}
    </button>
  );
}
