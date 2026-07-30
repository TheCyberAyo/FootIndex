"use client";

import { useEffect, useState } from "react";

import { fetchRecentSearchTerms } from "@/lib/search/session";

interface RecentSearchesProps {
  onSelect: (term: string) => void;
}

export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const [terms, setTerms] = useState<string[]>([]);

  useEffect(() => {
    void fetchRecentSearchTerms(6).then(setTerms);
  }, []);

  if (terms.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm text-muted-foreground">Recent searches</p>
      <div className="flex flex-wrap gap-2">
        {terms.map((term) => (
          <button
            key={term}
            type="button"
            className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-brand/40"
            onClick={() => onSelect(term)}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
