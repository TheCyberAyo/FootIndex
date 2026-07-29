/** Lowercase slug segments joined by hyphens (matches DB + spec URL strategy). */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Canonical player page path per PROJECT_SPECIFICATION §44 / §83.
 */
export function playerPath(slug: string): string {
  return `/player/${slug}`;
}

export function isValidPlayerSlugFormat(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}
