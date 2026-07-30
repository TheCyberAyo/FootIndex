"use client";

import { Loader2, Search, Upload, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  adminImportPlayer,
  adminImportWorldSquads,
  adminRunSync,
  adminSearchApiFootballPlayers,
  adminSeedCatalog,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminDashboardProps {
  stats: {
    players: number;
    competitions: number;
    transfers: number;
    comparisonCacheEntries: number;
  };
}

interface ApiSearchResult {
  apiFootballId: number;
  name: string;
  nationality: string | null;
  age: number | null;
  photo: string | null;
  club: string | null;
  league: string | null;
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiSearchResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<unknown>, successLabel: string) {
    startTransition(async () => {
      setMessage(null);
      try {
        const result = await action();
        setMessage(`${successLabel}: ${JSON.stringify(result)}`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Action failed.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <div>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Data pipeline
        </p>
        <h1 className="font-display text-3xl font-bold">Player onboarding</h1>
        <p className="mt-2 text-muted-foreground">
          Search API-Football, import a player, sync stats, trophies, and transfers.
          Dev-only unless <code>ADMIN_ENABLED=true</code>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Players", stats.players],
          ["Competitions", stats.competitions],
          ["Transfers", stats.transfers],
          ["Compare cache", stats.comparisonCacheEntries],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Search className="h-5 w-5" />
          Find & import player
        </h2>
        <div className="flex gap-2">
          <Input
            placeholder='Search API-Football (e.g. "Messi")'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button
            type="button"
            disabled={pending || query.trim().length < 2}
            onClick={() =>
              runAction(async () => {
                const rows = await adminSearchApiFootballPlayers(query);
                setResults(rows);
                return { found: rows.length };
              }, "Search complete")
            }
          >
            Search
          </Button>
        </div>

        {results.length > 0 ? (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {results.map((player) => (
              <li
                key={player.apiFootballId}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ID {player.apiFootballId}
                    {player.club ? ` · ${player.club}` : ""}
                    {player.league ? ` · ${player.league}` : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    runAction(
                      () => adminImportPlayer(player.apiFootballId),
                      `Imported ${player.name}`,
                    )
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import + sync
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Zap className="h-5 w-5" />
          Batch operations
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => runAction(adminSeedCatalog, "Catalog seeded")}
          >
            Seed starter catalog
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              runAction(
                () => adminImportWorldSquads({ maxTeams: 5, offset: 0 }),
                "World squads imported",
              )
            }
          >
            Import 5 club squads
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              runAction(
                () =>
                  adminRunSync({
                    job: "players",
                    limit: 10,
                    offset: 0,
                    delayMs: 600,
                  }),
                "Sync batch complete",
              )
            }
          >
            Sync 10 players
          </Button>
        </div>
      </section>

      {pending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Working…
        </p>
      ) : null}

      {message ? (
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">{message}</pre>
      ) : null}

      <p className="text-sm text-muted-foreground">
        After import, open the player profile from search or{" "}
        <Link href="/search" className="underline">
          /search
        </Link>
        . API docs:{" "}
        <Link href="/api-docs" className="underline">
          /api-docs
        </Link>
        .
      </p>
    </div>
  );
}
