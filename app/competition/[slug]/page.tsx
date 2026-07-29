import { notFound } from "next/navigation";

import {
  CompetitionRoutePage,
  createCompetitionMetadata,
} from "@/components/competitions/competition-route-page";
import { isValidCompetitionSlugFormat } from "@/lib/competitions/paths";
import { competitionPath } from "@/lib/competitions/paths";
import { createPageMetadata } from "@/lib/seo";
import { getCompetitionBySlug, listCompetitions } from "@/services";

export const revalidate = 60;
export const dynamicParams = true;

interface CompetitionSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const competitions = await listCompetitions();
  return competitions.map((competition) => ({ slug: competition.slug }));
}

export async function generateMetadata({ params }: CompetitionSlugPageProps) {
  const { slug } = await params;
  if (!isValidCompetitionSlugFormat(slug)) {
    return createPageMetadata({
      title: "Competition not found",
      description: "This competition page does not exist.",
      path: competitionPath(slug),
      noIndex: true,
    });
  }
  return createCompetitionMetadata(slug);
}

export default async function CompetitionSlugPage({
  params,
}: CompetitionSlugPageProps) {
  const { slug } = await params;
  if (!isValidCompetitionSlugFormat(slug)) {
    notFound();
  }

  const competition = await getCompetitionBySlug(slug);
  if (!competition) {
    notFound();
  }

  return <CompetitionRoutePage slug={slug} />;
}
