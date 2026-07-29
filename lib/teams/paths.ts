import { isValidSlugFormat } from "@/lib/slug";

export function teamPath(slug: string): string {
  return `/team/${slug}`;
}

export function isValidTeamSlugFormat(slug: string): boolean {
  return isValidSlugFormat(slug);
}
