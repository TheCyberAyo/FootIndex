import Link from "next/link";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { GlassCard } from "@/components/shared/glass-card";
import { FixturesList } from "@/components/fixtures/fixtures-list";
import { StandingsTable } from "@/components/fixtures/standings-table";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { competitionPath } from "@/lib/competitions/paths";
import { playerPath } from "@/lib/players/paths";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo/json-ld";
import {
  getCompetitionBySlug,
  listCompetitionLeaderboard,
} from "@/services/competitions/competitions.service";
import { listMatchesForCompetition } from "@/services/matches/matches.service";
import { listCompetitionStandings } from "@/services/standings/standings.service";

export async function createCompetitionMetadata(slug: string) {
  const competition = await getCompetitionBySlug(slug);
  if (!competition) {
    return createPageMetadata({
      title: "Competition not found",
      description: "This competition page does not exist.",
      path: competitionPath(slug),
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${competition.name} Top Scorers & Stats`,
    description: `Explore ${competition.name} goal scorers, assists, and player stats from synced season data.`,
    path: competitionPath(slug),
    keywords: [
      competition.name,
      `${competition.name} top scorers`,
      `${competition.name} stats`,
    ],
  });
}

interface CompetitionRoutePageProps {
  slug: string;
}

export async function CompetitionRoutePage({ slug }: CompetitionRoutePageProps) {
  const competition = await getCompetitionBySlug(slug);
  if (!competition) {
    return null;
  }

  const leaderboard = await listCompetitionLeaderboard(slug);
  const standings = await listCompetitionStandings(slug);
  const fixtures = await listMatchesForCompetition(competition.name);
  const path = competitionPath(slug);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Competitions", path: "/competition" },
    { name: competition.name, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: `${competition.name} Top Scorers & Stats`,
            description: `Player stats for ${competition.name}.`,
            path,
          }),
          createBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        eyebrow="Competition"
        title={competition.name}
        description="Aggregated goals and assists from synced season rows in our database."
      />

      <Section
        title="Team standings"
        description="Aggregated team goal totals from synced season rows (proxy table — not official league points)."
      >
        <StandingsTable rows={standings} />
      </Section>

      <Section title="Fixtures" description="Recent matches in this competition.">
        <FixturesList matches={fixtures} />
      </Section>

      <Section title="Top scorers">
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs tracking-wide text-foreground/40 uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">Player</th>
                  <th className="px-3 py-3 font-medium">Apps</th>
                  <th className="px-3 py-3 font-medium">Goals</th>
                  <th className="px-5 py-3 font-medium">Assists</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-foreground/50">
                      No season stats for this competition yet.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((row, index) => (
                    <tr
                      key={row.player.id}
                      className="border-t border-border/60 text-foreground/80"
                    >
                      <td className="px-5 py-3 font-medium text-brand">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={playerPath(row.player.slug)}
                          className="font-medium text-foreground hover:text-brand"
                        >
                          {row.player.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3">{row.appearances}</td>
                      <td className="px-3 py-3 text-brand">{row.goals}</td>
                      <td className="px-5 py-3">{row.assists}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </Section>
    </>
  );
}
