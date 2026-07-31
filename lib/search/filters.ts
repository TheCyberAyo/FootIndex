import type { PlayerPosition } from "@/types/database";

export interface PlayerSearchFilters {
  position?: PlayerPosition;
  nationality?: string;
  club?: string;
  competition?: string;
  ageMin?: number;
  ageMax?: number;
}

const POSITIONS: PlayerPosition[] = ["GK", "DF", "MF", "FW"];

export const SEARCH_POSITION_OPTIONS: Array<{
  value: PlayerPosition;
  label: string;
}> = [
  { value: "GK", label: "Goalkeeper" },
  { value: "DF", label: "Defender" },
  { value: "MF", label: "Midfielder" },
  { value: "FW", label: "Forward" },
];

function parseAge(value: string | number | null | undefined): number | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  const rounded = Math.trunc(parsed);
  if (rounded < 15 || rounded > 45) {
    return undefined;
  }

  return rounded;
}

export function parseSearchFilters(input: {
  position?: string | null;
  nationality?: string | null;
  club?: string | null;
  competition?: string | null;
  ageMin?: string | number | null;
  ageMax?: string | number | null;
}): PlayerSearchFilters {
  const filters: PlayerSearchFilters = {};
  const position = input.position?.trim().toUpperCase();

  if (position && POSITIONS.includes(position as PlayerPosition)) {
    filters.position = position as PlayerPosition;
  }

  const nationality = input.nationality?.trim();
  if (nationality && nationality.length >= 2) {
    filters.nationality = nationality;
  }

  const club = input.club?.trim();
  if (club && club.length >= 2) {
    filters.club = club;
  }

  const competition = input.competition?.trim();
  if (competition && competition.length >= 2) {
    filters.competition = competition;
  }

  const ageMin = parseAge(input.ageMin);
  const ageMax = parseAge(input.ageMax);
  if (ageMin != null) {
    filters.ageMin = ageMin;
  }
  if (ageMax != null) {
    filters.ageMax = ageMax;
  }

  if (
    filters.ageMin != null &&
    filters.ageMax != null &&
    filters.ageMin > filters.ageMax
  ) {
    delete filters.ageMin;
    delete filters.ageMax;
  }

  return filters;
}

export function buildSearchQueryString(input: {
  q?: string;
  filters?: PlayerSearchFilters;
}): string {
  const params = new URLSearchParams();
  const query = input.q?.trim();

  if (query && query.length >= 2) {
    params.set("q", query);
  }

  if (input.filters?.position) {
    params.set("position", input.filters.position);
  }

  if (input.filters?.nationality) {
    params.set("nationality", input.filters.nationality);
  }

  if (input.filters?.club) {
    params.set("club", input.filters.club);
  }

  if (input.filters?.competition) {
    params.set("competition", input.filters.competition);
  }

  if (input.filters?.ageMin != null) {
    params.set("ageMin", String(input.filters.ageMin));
  }

  if (input.filters?.ageMax != null) {
    params.set("ageMax", String(input.filters.ageMax));
  }

  return params.toString();
}

export function buildSearchPath(input: {
  q?: string;
  filters?: PlayerSearchFilters;
}): string {
  const queryString = buildSearchQueryString(input);
  return queryString ? `/search?${queryString}` : "/search";
}

export function hasActiveSearchFilters(filters?: PlayerSearchFilters): boolean {
  if (!filters) {
    return false;
  }

  return Boolean(
    filters.position ||
      filters.nationality ||
      filters.club ||
      filters.competition ||
      filters.ageMin != null ||
      filters.ageMax != null,
  );
}

export function filtersCacheKey(filters?: PlayerSearchFilters): string {
  if (!filters) {
    return "";
  }

  return [
    filters.position ?? "",
    filters.nationality?.toLowerCase() ?? "",
    filters.club?.toLowerCase() ?? "",
    filters.competition?.toLowerCase() ?? "",
    filters.ageMin != null ? String(filters.ageMin) : "",
    filters.ageMax != null ? String(filters.ageMax) : "",
  ].join("|");
}

export function clearSearchFilters(): PlayerSearchFilters {
  return {};
}

export function searchFilterChipLabels(
  filters: PlayerSearchFilters,
): Array<{ key: keyof PlayerSearchFilters; label: string }> {
  const chips: Array<{ key: keyof PlayerSearchFilters; label: string }> = [];

  if (filters.position) {
    const option = SEARCH_POSITION_OPTIONS.find(
      (entry) => entry.value === filters.position,
    );
    chips.push({
      key: "position",
      label: option?.label ?? filters.position,
    });
  }

  if (filters.nationality) {
    chips.push({ key: "nationality", label: filters.nationality });
  }

  if (filters.club) {
    chips.push({ key: "club", label: filters.club });
  }

  if (filters.competition) {
    chips.push({ key: "competition", label: filters.competition });
  }

  if (filters.ageMin != null && filters.ageMax != null) {
    chips.push({
      key: "ageMin",
      label: `Age ${filters.ageMin}–${filters.ageMax}`,
    });
  } else if (filters.ageMin != null) {
    chips.push({ key: "ageMin", label: `Age ${filters.ageMin}+` });
  } else if (filters.ageMax != null) {
    chips.push({ key: "ageMax", label: `Age ≤${filters.ageMax}` });
  }

  return chips;
}
