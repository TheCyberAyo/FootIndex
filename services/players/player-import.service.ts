import { STARTER_PLAYER_CATALOG } from "@/lib/data/starter-catalog";
import { isSupabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { assertNoError, ServiceError } from "@/services/errors";
import { fetchPlayerById } from "@/services/api-football/endpoints";
import {
  mapPlayerProfileUpdate,
  mapPositionFromStats,
} from "@/services/sync/mappers";
import { syncPlayerBySlug } from "@/services/sync/sync.service";
import { DEFAULT_SYNC_SEASON } from "@/lib/api-football/constants";

export interface PlayerImportResult {
  slug: string;
  apiFootballId: number;
  created: boolean;
  synced: boolean;
}

async function ensurePlayerRow(input: {
  slug: string;
  apiFootballId: number;
  name: string;
  shortName: string;
  dateOfBirth: string;
  nationality: string;
  heightCm: number;
  position: "GK" | "DF" | "MF" | "FW";
  bio: string;
  imageUrl: string | null;
}): Promise<{ id: string; created: boolean }> {
  const supabase = createSupabaseAdminClient();

  const existing = await supabase
    .from("players")
    .select("id, slug")
    .or(`slug.eq.${input.slug},api_football_id.eq.${input.apiFootballId}`)
    .maybeSingle();

  assertNoError(existing.error, "Failed to look up player for import");

  if (existing.data) {
    return { id: existing.data.id, created: false };
  }

  const inserted = await supabase
    .from("players")
    .insert({
      slug: input.slug,
      name: input.name,
      short_name: input.shortName,
      date_of_birth: input.dateOfBirth,
      nationality: input.nationality,
      height_cm: input.heightCm,
      position: input.position,
      bio: input.bio,
      image_url: input.imageUrl,
      api_football_id: input.apiFootballId,
    })
    .select("id")
    .single();

  assertNoError(inserted.error, "Failed to insert imported player");

  if (!inserted.data) {
    throw new ServiceError("Player insert returned no row.", "PLAYER_IMPORT_EMPTY");
  }

  return { id: inserted.data.id, created: true };
}

export async function importPlayerByApiId(
  apiFootballId: number,
  slugOverride?: string,
  season = DEFAULT_SYNC_SEASON,
): Promise<PlayerImportResult> {
  if (!isSupabaseConfigured()) {
    throw new ServiceError(
      "Player import requires Supabase admin configuration.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  const payload = await fetchPlayerById(apiFootballId, season);
  if (!payload) {
    throw new ServiceError(
      `No API-Football player found for id ${apiFootballId}.`,
      "PLAYER_NOT_FOUND",
    );
  }

  const profile = mapPlayerProfileUpdate(payload.player);
  const slug =
    slugOverride?.trim() ||
    slugify(profile.name) ||
    slugify(payload.player.name) ||
    `player-${apiFootballId}`;

  const { created } = await ensurePlayerRow({
    slug,
    apiFootballId,
    name: profile.name,
    shortName: profile.short_name,
    dateOfBirth: profile.date_of_birth,
    nationality: profile.nationality,
    heightCm: profile.height_cm,
    position: mapPositionFromStats(payload.statistics),
    bio: `${profile.name} — football player profile on FootIndex.`,
    imageUrl: profile.image_url,
  });

  let synced = false;
  try {
    await syncPlayerBySlug(slug, season);
    synced = true;
  } catch {
    synced = false;
  }

  return { slug, apiFootballId, created, synced };
}

export async function seedStarterPlayerCatalog(
  season = DEFAULT_SYNC_SEASON,
): Promise<PlayerImportResult[]> {
  const results: PlayerImportResult[] = [];

  for (const entry of STARTER_PLAYER_CATALOG) {
    const supabase = createSupabaseAdminClient();
    const existing = await supabase
      .from("players")
      .select("slug")
      .eq("slug", entry.slug)
      .maybeSingle();

    assertNoError(existing.error, "Failed to check catalog player");

    if (existing.data) {
      try {
        await syncPlayerBySlug(entry.slug, season);
        results.push({
          slug: entry.slug,
          apiFootballId: entry.apiFootballId,
          created: false,
          synced: true,
        });
      } catch {
        results.push({
          slug: entry.slug,
          apiFootballId: entry.apiFootballId,
          created: false,
          synced: false,
        });
      }
      continue;
    }

    await ensurePlayerRow({
      slug: entry.slug,
      apiFootballId: entry.apiFootballId,
      name: entry.name,
      shortName: entry.shortName,
      dateOfBirth: entry.dateOfBirth,
      nationality: entry.nationality,
      heightCm: entry.heightCm,
      position: entry.position,
      bio: entry.bio,
      imageUrl: null,
    });

    let synced = false;
    try {
      await syncPlayerBySlug(entry.slug, season);
      synced = true;
    } catch {
      synced = false;
    }

    results.push({
      slug: entry.slug,
      apiFootballId: entry.apiFootballId,
      created: true,
      synced,
    });
  }

  return results;
}
