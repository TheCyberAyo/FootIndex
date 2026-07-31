import type { PlayerPosition } from "@/types/database";
import { getPlayerAge } from "@/lib/players/format";

export interface RankingFilters {
  position?: PlayerPosition;
  nationality?: string;
  competition?: string;
  season?: string;
  ageMin?: number;
  ageMax?: number;
}

const POSITIONS: PlayerPosition[] = ["GK", "DF", "MF", "FW"];

function parseAge(value: string | null | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  const rounded = Math.trunc(parsed);
  if (rounded < 15 || rounded > 45) {
    return undefined;
  }

  return rounded;
}

export function parseRankingFilters(input: {
  position?: string | null;
  nationality?: string | null;
  competition?: string | null;
  season?: string | null;
  ageMin?: string | null;
  ageMax?: string | null;
}): RankingFilters {
  const filters: RankingFilters = {};
  const position = input.position?.trim().toUpperCase();

  if (position && POSITIONS.includes(position as PlayerPosition)) {
    filters.position = position as PlayerPosition;
  }

  const nationality = input.nationality?.trim();
  if (nationality && nationality.length >= 2) {
    filters.nationality = nationality;
  }

  const competition = input.competition?.trim();
  if (competition && competition.length >= 2) {
    filters.competition = competition;
  }

  const season = input.season?.trim();
  if (season && /^\d{4}$/.test(season)) {
    filters.season = season;
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

export function hasActiveRankingFilters(filters?: RankingFilters): boolean {
  if (!filters) {
    return false;
  }

  return Boolean(
    filters.position ||
      filters.nationality ||
      filters.competition ||
      filters.season ||
      filters.ageMin != null ||
      filters.ageMax != null,
  );
}

export function buildRankingQueryString(filters: RankingFilters): string {
  const params = new URLSearchParams();

  if (filters.position) {
    params.set("position", filters.position);
  }
  if (filters.nationality) {
    params.set("nationality", filters.nationality);
  }
  if (filters.competition) {
    params.set("competition", filters.competition);
  }
  if (filters.season) {
    params.set("season", filters.season);
  }
  if (filters.ageMin != null) {
    params.set("ageMin", String(filters.ageMin));
  }
  if (filters.ageMax != null) {
    params.set("ageMax", String(filters.ageMax));
  }

  return params.toString();
}

export function rankingFilterCacheKey(filters?: RankingFilters): string {
  if (!filters) {
    return "";
  }

  return [
    filters.position ?? "",
    filters.nationality?.toLowerCase() ?? "",
    filters.competition?.toLowerCase() ?? "",
    filters.season ?? "",
    filters.ageMin != null ? String(filters.ageMin) : "",
    filters.ageMax != null ? String(filters.ageMax) : "",
  ].join("|");
}

export function playerMatchesRankingFilters(
  player: {
    position: PlayerPosition;
    nationality: string;
    date_of_birth: string;
  },
  filters?: RankingFilters,
): boolean {
  if (!filters) {
    return true;
  }

  if (filters.position && player.position !== filters.position) {
    return false;
  }

  const nationality = filters.nationality?.trim().toLowerCase();
  if (
    nationality &&
    !player.nationality.toLowerCase().includes(nationality)
  ) {
    return false;
  }

  const age = getPlayerAge(player.date_of_birth);
  if (filters.ageMin != null && age < filters.ageMin) {
    return false;
  }
  if (filters.ageMax != null && age > filters.ageMax) {
    return false;
  }

  return true;
}
