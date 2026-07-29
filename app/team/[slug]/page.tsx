import { notFound } from "next/navigation";

import {
  TeamRoutePage,
  createTeamMetadata,
} from "@/components/teams/team-route-page";
import { isValidTeamSlugFormat } from "@/lib/teams/paths";
import { createPageMetadata } from "@/lib/seo";
import { teamPath } from "@/lib/teams/paths";
import { getTeamBySlug, listTeams } from "@/services";

export const revalidate = 60;
export const dynamicParams = true;

interface TeamSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const teams = await listTeams();
  return teams.map((team) => ({ slug: team.slug }));
}

export async function generateMetadata({ params }: TeamSlugPageProps) {
  const { slug } = await params;
  if (!isValidTeamSlugFormat(slug)) {
    return createPageMetadata({
      title: "Team not found",
      description: "This team page does not exist.",
      path: teamPath(slug),
      noIndex: true,
    });
  }
  return createTeamMetadata(slug);
}

export default async function TeamSlugPage({ params }: TeamSlugPageProps) {
  const { slug } = await params;
  if (!isValidTeamSlugFormat(slug)) {
    notFound();
  }

  const team = await getTeamBySlug(slug);
  if (!team) {
    notFound();
  }

  return <TeamRoutePage slug={slug} />;
}
