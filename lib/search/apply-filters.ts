import type { PlayerSearchFilters } from "@/lib/search/filters";
import type { PlayerSearchResult } from "@/types/domain";

export function applySearchFilters(
  results: PlayerSearchResult[],
  filters?: PlayerSearchFilters,
): PlayerSearchResult[] {
  if (!filters) {
    return results;
  }

  const nationality = filters.nationality?.trim().toLowerCase();
  const club = filters.club?.trim().toLowerCase();
  const competition = filters.competition?.trim().toLowerCase();

  return results.filter((result) => {
    if (filters.position && result.position !== filters.position) {
      return false;
    }

    if (
      nationality &&
      !result.nationality.toLowerCase().includes(nationality)
    ) {
      return false;
    }

    if (club && !(result.clubName?.toLowerCase().includes(club) ?? false)) {
      return false;
    }

    if (
      competition &&
      !(result.competition?.toLowerCase().includes(competition) ?? false)
    ) {
      return false;
    }

    if (filters.ageMin != null && result.age < filters.ageMin) {
      return false;
    }

    if (filters.ageMax != null && result.age > filters.ageMax) {
      return false;
    }

    return true;
  });
}
