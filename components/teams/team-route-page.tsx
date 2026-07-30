import Link from "next/link";
import Image from "next/image";

import { TeamSquad } from "@/components/teams/team-squad";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo/json-ld";
import { teamPath } from "@/lib/teams/paths";
import { getTeamBySlug, listPlayersByTeamId } from "@/services/teams/teams.service";
import { SITE_URL } from "@/lib/constants";

export async function createTeamMetadata(slug: string) {
  const team = await getTeamBySlug(slug);
  if (!team) {
    return createPageMetadata({
      title: "Team not found",
      description: "This team page does not exist.",
      path: teamPath(slug),
      noIndex: true,
    });
  }

  const typeLabel = team.team_type === "national" ? "National team" : "Club";

  return createPageMetadata({
    title: `${team.name} Squad & Players`,
    description: `${typeLabel} profile for ${team.name} — current squad, player stats, and links to career profiles.`,
    path: teamPath(slug),
    keywords: [team.name, `${team.name} players`, team.country, "football team"],
  });
}

function createSportsTeamJsonLd(
  team: Awaited<ReturnType<typeof getTeamBySlug>> & object,
  path: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "@id": `${SITE_URL}${path}#team`,
    name: team.name,
    url: `${SITE_URL}${path}`,
    sport: "Soccer",
    memberOf: {
      "@type": "Country",
      name: team.country,
    },
    logo: team.logo_url ?? undefined,
  };
}

interface TeamRoutePageProps {
  slug: string;
}

export async function TeamRoutePage({ slug }: TeamRoutePageProps) {
  const team = await getTeamBySlug(slug);
  if (!team) {
    return null;
  }

  const squad = await listPlayersByTeamId(team.id);
  const path = teamPath(slug);
  const typeLabel = team.team_type === "national" ? "National team" : "Club";
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Teams", path: "/search" },
    { name: team.name, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: `${team.name} Squad & Players`,
            description: `${typeLabel} profile for ${team.name}.`,
            path,
          }),
          createSportsTeamJsonLd(team, path),
          createBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        eyebrow={typeLabel}
        title={team.name}
        description={`${team.country} · ${squad.length} player${squad.length === 1 ? "" : "s"} in our database.`}
      />

      {team.logo_url ? (
        <Section containerClassName="!py-0 -mt-6">
          <Image
            src={team.logo_url}
            alt={`${team.name} crest`}
            width={80}
            height={80}
            className="size-20 object-contain"
          />
        </Section>
      ) : null}

      <Section
        title="Current squad"
        description="Players linked to this team in FootIndex."
      >
        <TeamSquad players={squad} teamName={team.name} />
      </Section>

      <Section title="Explore">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            variant="brand"
          >
            <Link href="/rankings/top-scorers">Top scorers</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/search">Search players</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
