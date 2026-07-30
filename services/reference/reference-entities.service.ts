import { competitionSlugFromName } from "@/lib/competitions/paths";
import { seasonLabel } from "@/services/sync/mappers";
import { slugify } from "@/lib/slug";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { assertNoError } from "@/services/errors";
import type { CompetitionType } from "@/types/database";

function inferCompetitionType(name: string): CompetitionType {
  const normalized = name.toLowerCase();
  if (
    normalized.includes("world cup") ||
    normalized.includes("nations") ||
    normalized.includes("euro") ||
    normalized.includes("afcon") ||
    normalized.includes("copa america")
  ) {
    return "international";
  }
  if (
    normalized.includes("league") ||
    normalized.includes("liga") ||
    normalized.includes("serie") ||
    normalized.includes("bundesliga") ||
    normalized.includes("premier")
  ) {
    return "league";
  }
  if (
    normalized.includes("cup") ||
    normalized.includes("champions") ||
    normalized.includes("europa")
  ) {
    return "cup";
  }
  return "other";
}

export async function ensureCountryByName(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const existing = await supabase
    .from("countries")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();

  assertNoError(existing.error, "Failed to look up country");

  if (existing.data) {
    return existing.data.id;
  }

  const inserted = await supabase
    .from("countries")
    .insert({ name: trimmed })
    .select("id")
    .single();

  assertNoError(inserted.error, "Failed to insert country");
  return inserted.data?.id ?? null;
}

export async function ensureCompetition(input: {
  name: string;
  apiFootballId?: number | null;
  countryName?: string | null;
  logoUrl?: string | null;
}): Promise<string> {
  const name = input.name.trim();
  const slug = competitionSlugFromName(name);
  const supabase = createSupabaseAdminClient();

  if (input.apiFootballId != null) {
    const byApi = await supabase
      .from("competitions")
      .select("id")
      .eq("api_football_id", input.apiFootballId)
      .maybeSingle();

    assertNoError(byApi.error, "Failed to look up competition by API id");

    if (byApi.data) {
      return byApi.data.id;
    }
  }

  const bySlug = await supabase
    .from("competitions")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  assertNoError(bySlug.error, "Failed to look up competition by slug");

  const countryId = input.countryName
    ? await ensureCountryByName(input.countryName)
    : null;

  if (bySlug.data) {
    if (input.apiFootballId != null || input.logoUrl) {
      await supabase
        .from("competitions")
        .update({
          api_football_id: input.apiFootballId ?? undefined,
          logo_url: input.logoUrl ?? undefined,
          country_id: countryId ?? undefined,
        })
        .eq("id", bySlug.data.id);
    }
    return bySlug.data.id;
  }

  const inserted = await supabase
    .from("competitions")
    .insert({
      slug,
      name,
      api_football_id: input.apiFootballId ?? null,
      country_id: countryId,
      logo_url: input.logoUrl ?? null,
      competition_type: inferCompetitionType(name),
    })
    .select("id")
    .single();

  assertNoError(inserted.error, "Failed to insert competition");

  if (!inserted.data) {
    throw new Error("Competition insert returned no row.");
  }

  return inserted.data.id;
}

export async function ensureSeason(input: {
  seasonYear: number;
  label?: string;
}): Promise<string> {
  const label = input.label ?? seasonLabel(input.seasonYear);
  const supabase = createSupabaseAdminClient();

  const existing = await supabase
    .from("seasons")
    .select("id")
    .eq("label", label)
    .maybeSingle();

  assertNoError(existing.error, "Failed to look up season");

  if (existing.data) {
    return existing.data.id;
  }

  const inserted = await supabase
    .from("seasons")
    .insert({
      year: input.seasonYear,
      label,
      active: input.seasonYear >= new Date().getFullYear() - 1,
    })
    .select("id")
    .single();

  assertNoError(inserted.error, "Failed to insert season");

  if (!inserted.data) {
    throw new Error("Season insert returned no row.");
  }

  return inserted.data.id;
}

export async function ensureTeamSlugUnique(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  const supabase = createSupabaseAdminClient();
  let candidate = baseSlug || "team";
  let suffix = 2;

  while (true) {
    let query = supabase.from("teams").select("id").eq("slug", candidate);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    const existing = await query.maybeSingle();
    assertNoError(existing.error, "Failed to check team slug");

    if (!existing.data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function ensureTeamByApiRef(input: {
  apiId: number;
  name: string;
  logo: string | null;
  countryName?: string | null;
  teamType?: "club" | "national";
}): Promise<string> {
  const supabase = createSupabaseAdminClient();

  const existing = await supabase
    .from("teams")
    .select("id")
    .eq("api_football_id", input.apiId)
    .maybeSingle();

  assertNoError(existing.error, "Failed to look up team");

  if (existing.data) {
    await supabase
      .from("teams")
      .update({
        name: input.name,
        short_name: input.name,
        logo_url: input.logo,
        country: input.countryName ?? "Unknown",
      })
      .eq("id", existing.data.id);
    return existing.data.id;
  }

  const slug = await ensureTeamSlugUnique(slugify(input.name));

  const inserted = await supabase
    .from("teams")
    .insert({
      slug,
      name: input.name,
      short_name: input.name,
      country: input.countryName ?? "Unknown",
      team_type: input.teamType ?? "club",
      logo_url: input.logo,
      api_football_id: input.apiId,
    })
    .select("id")
    .single();

  assertNoError(inserted.error, "Failed to insert team");

  if (!inserted.data) {
    throw new Error("Team insert returned no row.");
  }

  return inserted.data.id;
}
