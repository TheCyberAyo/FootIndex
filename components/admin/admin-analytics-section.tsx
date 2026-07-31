"use client";

import Link from "next/link";

import type { AdminActivityAnalytics } from "@/services/analytics/activity-analytics.service";

interface AdminAnalyticsSectionProps {
  analytics: AdminActivityAnalytics;
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}

function PlayerRankList({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: AdminActivityAnalytics["mostSearchedPlayers"];
  emptyLabel: string;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ol className="divide-y divide-border rounded-lg border border-border">
          {rows.map((row, index) => (
            <li
              key={row.playerId}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 shrink-0 text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <Link href={row.href} className="truncate font-medium hover:underline">
                  {row.name}
                </Link>
              </div>
              <span className="shrink-0 text-sm text-muted-foreground">
                {row.count.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function AdminAnalyticsSection({ analytics }: AdminAnalyticsSectionProps) {
  const { engagement } = analytics;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Analytics
        </p>
        <h2 className="font-display text-2xl font-bold">Engagement (§105)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bounce rate, search CTR, returning visitors, and 404 tracking — last 30 days unless noted.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">1. Bounce rate</h3>
        <p className="text-sm text-muted-foreground">
          Single-page sessions with no player profile view or search click-through.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Bounce rate (30d)"
            value={`${engagement.bounceRate30Days}%`}
            detail={`${engagement.bouncedSessions30Days.toLocaleString()} of ${engagement.totalSessions30Days.toLocaleString()} sessions`}
          />
          <MetricCard
            label="Bounced sessions"
            value={engagement.bouncedSessions30Days.toLocaleString()}
          />
          <MetricCard
            label="Tracked sessions"
            value={engagement.totalSessions30Days.toLocaleString()}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">2. Search CTR</h3>
        <p className="text-sm text-muted-foreground">
          Searches that led to a player profile click vs total recorded searches.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Search click-through (30d)"
            value={`${engagement.searchClickThroughRate30Days}%`}
            detail={`${engagement.searchClicks30Days.toLocaleString()} of ${engagement.searchQueries30Days.toLocaleString()} searches`}
          />
          <MetricCard
            label="Player-linked searches"
            value={engagement.searchClicks30Days.toLocaleString()}
          />
          <MetricCard
            label="Total searches"
            value={engagement.searchQueries30Days.toLocaleString()}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">3. Returning visitors</h3>
        <p className="text-sm text-muted-foreground">
          Page views from visitors who have been seen before on this device.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Returning visitor rate (30d)"
            value={`${engagement.returningVisitorRate30Days}%`}
            detail={`${engagement.returningPageViews30Days.toLocaleString()} of ${engagement.totalPageViews30Days.toLocaleString()} page views`}
          />
          <MetricCard
            label="Returning page views"
            value={engagement.returningPageViews30Days.toLocaleString()}
          />
          <MetricCard
            label="Total page views"
            value={engagement.totalPageViews30Days.toLocaleString()}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">4. 404 tracking</h3>
        <p className="text-sm text-muted-foreground">
          Missing routes reported by the global not-found page.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="404 events (7d)"
            value={engagement.notFoundEventsLast7Days.toLocaleString()}
          />
          <MetricCard
            label="404 events (30d)"
            value={engagement.notFoundEventsLast30Days.toLocaleString()}
          />
        </div>
        {engagement.topNotFoundPaths.length > 0 ? (
          <ol className="mt-4 divide-y divide-border rounded-lg border border-border">
            {engagement.topNotFoundPaths.map((row, index) => (
              <li
                key={row.path}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 text-muted-foreground">
                    {index + 1}
                  </span>
                  <code className="truncate">{row.path}</code>
                </div>
                <span className="shrink-0 text-muted-foreground">
                  {row.count.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No 404 events recorded yet.</p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">5. Search abandonment</h3>
        <p className="text-sm text-muted-foreground">
          Recorded searches that did not click through to a player profile.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Abandonment rate (30d)"
            value={`${engagement.searchAbandonmentRate30Days}%`}
            detail={`${engagement.abandonedSearches30Days.toLocaleString()} of ${engagement.searchQueries30Days.toLocaleString()} searches`}
          />
          <MetricCard
            label="Abandoned searches"
            value={engagement.abandonedSearches30Days.toLocaleString()}
          />
          <MetricCard
            label="Recorded searches"
            value={engagement.searchQueries30Days.toLocaleString()}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold">6. Average session duration</h3>
        <p className="text-sm text-muted-foreground">
          Mean time between first and last page view per session (seconds).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Avg session duration (30d)"
            value={`${engagement.averageSessionDurationSeconds30Days}s`}
          />
          <MetricCard
            label="Tracked sessions"
            value={engagement.totalSessions30Days.toLocaleString()}
          />
        </div>
      </section>

      <div className="border-t border-border pt-8">
        <h2 className="font-display text-xl font-bold">Search & discovery</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Volume and ranking from search history and player views.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Searches (7d)"
          value={analytics.searchVolumeLast7Days.toLocaleString()}
        />
        <MetricCard
          label="Searches (30d)"
          value={analytics.searchVolumeLast30Days.toLocaleString()}
        />
        <MetricCard
          label="Profile views (7d)"
          value={analytics.playerViewsLast7Days.toLocaleString()}
        />
        <MetricCard
          label="Profile views (30d)"
          value={analytics.playerViewsLast30Days.toLocaleString()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlayerRankList
          title="Most searched players"
          rows={analytics.mostSearchedPlayers}
          emptyLabel="No player-linked searches yet."
        />
        <PlayerRankList
          title="Most viewed players"
          rows={analytics.mostViewedPlayers}
          emptyLabel="No profile views recorded yet."
        />
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold">Top search terms</h2>
        {analytics.topSearchTerms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No search terms recorded yet.</p>
        ) : (
          <ol className="divide-y divide-border rounded-lg border border-border">
            {analytics.topSearchTerms.map((row, index) => (
              <li
                key={row.term}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 text-sm text-muted-foreground">
                    {index + 1}
                  </span>
                  <Link
                    href={`/search?q=${encodeURIComponent(row.term)}`}
                    className="truncate font-medium hover:underline"
                  >
                    {row.term}
                  </Link>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {row.count.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
