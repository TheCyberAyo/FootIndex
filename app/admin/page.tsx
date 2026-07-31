import { notFound } from "next/navigation";

import { AdminAnalyticsSection } from "@/components/admin/admin-analytics-section";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAdminEnabled } from "@/lib/admin/access";
import { adminGetActivityAnalytics, adminGetPipelineStats } from "@/app/admin/actions";
import { EMPTY_ENGAGEMENT } from "@/services/analytics/activity-analytics.service";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Admin — Player onboarding",
  description: "Import players, sync stats, and manage the FootIndex data pipeline.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminPage() {
  if (!isAdminEnabled()) {
    notFound();
  }

  let stats = {
    players: 0,
    competitions: 0,
    transfers: 0,
    comparisonCacheEntries: 0,
  };
  let analytics = {
    searchVolumeLast7Days: 0,
    searchVolumeLast30Days: 0,
    playerViewsLast7Days: 0,
    playerViewsLast30Days: 0,
    comparisonViewsLast7Days: 0,
    comparisonViewsLast30Days: 0,
    mostSearchedPlayers: [],
    mostViewedPlayers: [],
    mostViewedComparisons: [],
    topSearchTerms: [],
    engagement: EMPTY_ENGAGEMENT,
  } as Awaited<ReturnType<typeof adminGetActivityAnalytics>>;

  try {
    [stats, analytics] = await Promise.all([
      adminGetPipelineStats(),
      adminGetActivityAnalytics(),
    ]);
  } catch {
    // Stats are optional when Supabase is offline.
  }

  return (
    <div className="space-y-12">
      <AdminAnalyticsSection analytics={analytics} />
      <AdminDashboard stats={stats} />
    </div>
  );
}
