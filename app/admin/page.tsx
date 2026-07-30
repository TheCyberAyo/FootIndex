import { notFound } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAdminEnabled } from "@/lib/admin/access";
import { adminGetPipelineStats } from "@/app/admin/actions";
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

  try {
    stats = await adminGetPipelineStats();
  } catch {
    // Stats are optional when Supabase is offline.
  }

  return <AdminDashboard stats={stats} />;
}
