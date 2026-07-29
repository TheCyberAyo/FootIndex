import Link from "next/link";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { competitionPath } from "@/lib/competitions/paths";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo/json-ld";
import { listCompetitions } from "@/services/competitions/competitions.service";

export const metadata = createPageMetadata({
  title: "Football Competitions",
  description:
    "Browse competitions with top scorers and player stats from synced season data.",
  path: "/competition",
  keywords: ["football competitions", "Premier League stats", "Champions League stats"],
});

export const revalidate = 60;

export default async function CompetitionIndexPage() {
  const competitions = await listCompetitions();
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Competitions", path: "/competition" },
  ];

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "Football Competitions",
            description: "Competition hubs with top scorers and player stats.",
            path: "/competition",
          }),
          createBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        eyebrow="Competitions"
        title="Football Competitions"
        description="Derived from synced season stats. Each hub lists top scorers and links to player profiles."
      />

      <Section title="Available competitions">
        {competitions.length === 0 ? (
          <GlassCard className="p-6 text-foreground/60">
            No competition data yet. Run a player sync to populate season stats.
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => (
              <GlassCard key={competition.slug} className="p-5" hover>
                <Link href={competitionPath(competition.slug)}>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {competition.name}
                  </h2>
                  <p className="mt-4 text-sm font-medium text-brand">
                    View stats →
                  </p>
                </Link>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
