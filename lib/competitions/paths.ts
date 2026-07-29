import { isValidSlugFormat, slugify } from "@/lib/slug";

export function competitionPath(slug: string): string {
  return `/competition/${slug}`;
}

export function competitionSlugFromName(name: string): string {
  return slugify(name);
}

export function isValidCompetitionSlugFormat(slug: string): boolean {
  return isValidSlugFormat(slug);
}
