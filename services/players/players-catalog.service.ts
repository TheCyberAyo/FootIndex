import { buildLocalPlayerSearchResults } from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { getPlayerAge, formatPosition } from "@/lib/players/format";
import { playerPath } from "@/lib/players/paths";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import type { PlayerSearchResult } from "@/types/domain";

export const PLAYERS_CATALOG_PAGE_SIZE = 24;

export interface PlayersCatalogPage {
  players: PlayerSearchResult[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  letter: string | null;
}

interface CatalogPlayerRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  date_of_birth: string;
  nationality: string;
  position: PlayerSearchResult["position"];
  image_url: string | null;
  current_team:
    | { name: string; logo_url: string | null }
    | { name: string; logo_url: string | null }[]
    | null;
}

function mapCatalogRow(row: CatalogPlayerRow): PlayerSearchResult {
  const team = Array.isArray(row.current_team)
    ? row.current_team[0]
    : row.current_team;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    age: getPlayerAge(row.date_of_birth),
    nationality: row.nationality,
    position: row.position,
    positionLabel: formatPosition(row.position),
    imageUrl: row.image_url,
    clubName: team?.name ?? null,
    clubLogoUrl: team?.logo_url ?? null,
    competition: null,
    href: playerPath(row.slug),
  };
}

function listLocalPlayersCatalog(input: {
  page: number;
  pageSize: number;
  letter: string | null;
}): PlayersCatalogPage {
  const normalizedLetter = input.letter?.toUpperCase() ?? null;
  const filtered = buildLocalPlayerSearchResults().filter((player) => {
    if (!normalizedLetter) {
      return true;
    }
    return player.name.toUpperCase().startsWith(normalizedLetter);
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const start = (page - 1) * input.pageSize;

  return {
    players: filtered.slice(start, start + input.pageSize),
    page,
    pageSize: input.pageSize,
    total,
    totalPages,
    letter: normalizedLetter,
  };
}

export async function listPlayersCatalog(input: {
  page?: number;
  pageSize?: number;
  letter?: string | null;
}): Promise<PlayersCatalogPage> {
  const pageSize = Math.max(1, Math.min(input.pageSize ?? PLAYERS_CATALOG_PAGE_SIZE, 48));
  const page = Math.max(1, input.page ?? 1);
  const letter = input.letter?.trim().toUpperCase().slice(0, 1) ?? null;

  if (!isSupabaseConfigured()) {
    return listLocalPlayersCatalog({ page, pageSize, letter });
  }

  try {
    const supabase = createSupabasePublicClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("players")
      .select(
        "id, slug, name, short_name, date_of_birth, nationality, position, image_url, current_team:teams!players_current_team_id_fkey(name, logo_url)",
        { count: "exact" },
      )
      .order("name", { ascending: true });

    if (letter) {
      query = query.ilike("name", `${letter}%`);
    }

    const result = await query.range(from, to);
    assertNoError(result.error, "Failed to list players catalog");

    const total = result.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const boundedPage = Math.min(page, totalPages);

    return {
      players: ((result.data ?? []) as CatalogPlayerRow[]).map(mapCatalogRow),
      page: boundedPage,
      pageSize,
      total,
      totalPages,
      letter,
    };
  } catch {
    return listLocalPlayersCatalog({ page, pageSize, letter });
  }
}
