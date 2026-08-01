import { localPlayers } from "@/lib/data/local-seed";
import { isSupabaseConfigured } from "@/lib/env";
import { getPlayerAge, formatPosition } from "@/lib/players/format";
import { compareCanonicalPath } from "@/lib/compare/paths";
import {
  isComparePickerEligible,
  isCompareReady,
} from "@/lib/compare/readiness";
import { playerPath } from "@/lib/players/paths";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { assertNoError } from "@/services/errors";
import { getPlayerProfileBySlug } from "@/services/players/players.service";
import type { PlayerPosition } from "@/types/database";

export interface SimilarPlayerResult {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  position: PlayerPosition;
  positionLabel: string;
  age: number;
  nationality: string;
  imageUrl: string | null;
  clubName: string | null;
  clubLogoUrl: string | null;
  competition: string | null;
  careerGoals: number;
  score: number;
  matchReasons: string[];
  href: string;
  compareHref: string | null;
}

interface CandidateRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  date_of_birth: string;
  nationality: string;
  position: PlayerPosition;
  image_url: string | null;
  current_team: { name: string; logo_url: string | null } | null;
  career: { goals: number } | null;
  latestCompetition: string | null;
}

function scoreSimilarity(
  source: {
    position: PlayerPosition;
    nationality: string;
    age: number;
    goals: number;
    competition: string | null;
  },
  candidate: CandidateRow,
): number {
  let score = 0;
  const candidateAge = getPlayerAge(candidate.date_of_birth);
  const candidateGoals = candidate.career?.goals ?? 0;

  if (candidate.position === source.position) {
    score += 4;
  }

  if (candidate.nationality === source.nationality) {
    score += 2;
  }

  if (
    source.competition &&
    candidate.latestCompetition &&
    candidate.latestCompetition === source.competition
  ) {
    score += 3;
  }

  if (Math.abs(candidateAge - source.age) <= 3) {
    score += 1;
  }

  if (source.goals > 0 && candidateGoals > 0) {
    const ratio = candidateGoals / source.goals;
    if (ratio >= 0.5 && ratio <= 1.5) {
      score += 2;
    }
  }

  return score;
}

function buildMatchReasons(
  source: {
    position: PlayerPosition;
    nationality: string;
    age: number;
    goals: number;
    competition: string | null;
  },
  candidate: CandidateRow,
): string[] {
  const reasons: string[] = [];
  const candidateAge = getPlayerAge(candidate.date_of_birth);
  const candidateGoals = candidate.career?.goals ?? 0;

  if (candidate.position === source.position) {
    reasons.push("Same position");
  }

  if (candidate.nationality === source.nationality) {
    reasons.push("Same nationality");
  }

  if (
    source.competition &&
    candidate.latestCompetition &&
    candidate.latestCompetition === source.competition
  ) {
    reasons.push("Same league");
  }

  if (Math.abs(candidateAge - source.age) <= 3) {
    reasons.push("Similar age");
  }

  if (source.goals > 0 && candidateGoals > 0) {
    const ratio = candidateGoals / source.goals;
    if (ratio >= 0.5 && ratio <= 1.5) {
      reasons.push("Similar scoring");
    }
  }

  return reasons;
}

async function loadCandidates(
  position: PlayerPosition,
  excludeId: string,
): Promise<CandidateRow[]> {
  if (!isSupabaseConfigured()) {
    return localPlayers
      .filter((player) => player.id !== excludeId && player.position === position)
      .map((player) => ({
        id: player.id,
        slug: player.slug,
        name: player.name,
        short_name: player.short_name,
        date_of_birth: player.date_of_birth,
        nationality: player.nationality,
        position: player.position,
        image_url: player.image_url,
        current_team: player.current_team
          ? {
              name: player.current_team.name,
              logo_url: player.current_team.logo_url,
            }
          : null,
        career: null,
        latestCompetition: null,
      }));
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("players")
    .select(
      "id, slug, name, short_name, date_of_birth, nationality, position, image_url, current_team:teams!players_current_team_id_fkey(name, logo_url), career:career_stats(goals)",
    )
    .eq("position", position)
    .neq("id", excludeId)
    .limit(120);

  assertNoError(result.error, "Failed to load similar player candidates");

  const rows = (result.data ?? []) as Array<
    Omit<CandidateRow, "latestCompetition"> & {
      career: { goals: number } | { goals: number }[] | null;
      current_team: CandidateRow["current_team"] | CandidateRow["current_team"][];
    }
  >;

  const ids = rows.map((row) => row.id);
  const competitions = new Map<string, string>();

  if (ids.length > 0) {
    const seasonResult = await supabase
      .from("season_stats")
      .select("player_id, competition, season")
      .in("player_id", ids)
      .order("season", { ascending: false });

    if (!seasonResult.error) {
      for (const row of seasonResult.data ?? []) {
        if (!competitions.has(row.player_id)) {
          competitions.set(row.player_id, row.competition);
        }
      }
    }
  }

  return rows.map((row) => {
    const team = Array.isArray(row.current_team)
      ? row.current_team[0]
      : row.current_team;
    const career = Array.isArray(row.career) ? row.career[0] : row.career;

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      short_name: row.short_name,
      date_of_birth: row.date_of_birth,
      nationality: row.nationality,
      position: row.position,
      image_url: row.image_url,
      current_team: team ?? null,
      career: career ?? null,
      latestCompetition: competitions.get(row.id) ?? null,
    };
  });
}

export async function listSimilarPlayers(
  slug: string,
  limit = 6,
): Promise<SimilarPlayerResult[]> {
  const profile = await getPlayerProfileBySlug(slug);
  if (!profile) {
    return [];
  }

  const canOfferCompare = isCompareReady(profile);

  const latestSeason = profile.seasons[0];
  const source = {
    position: profile.player.position,
    nationality: profile.player.nationality,
    age: getPlayerAge(profile.player.date_of_birth),
    goals: profile.career?.goals ?? 0,
    competition: latestSeason?.competition ?? null,
  };

  const candidates = await loadCandidates(
    profile.player.position,
    profile.player.id,
  );

  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: scoreSimilarity(source, candidate),
    }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.candidate.career?.goals ?? 0) - (a.candidate.career?.goals ?? 0),
    )
    .slice(0, limit);

  if (ranked.length === 0) {
    return candidates
      .sort(
        (a, b) =>
          (b.career?.goals ?? 0) - (a.career?.goals ?? 0) ||
          a.name.localeCompare(b.name),
      )
      .slice(0, limit)
      .map((candidate) => ({
        id: candidate.id,
        slug: candidate.slug,
        name: candidate.name,
        shortName: candidate.short_name,
        position: candidate.position,
        positionLabel: formatPosition(candidate.position),
        age: getPlayerAge(candidate.date_of_birth),
        nationality: candidate.nationality,
        imageUrl: candidate.image_url,
        clubName: candidate.current_team?.name ?? null,
        clubLogoUrl: candidate.current_team?.logo_url ?? null,
        competition: candidate.latestCompetition,
        careerGoals: candidate.career?.goals ?? 0,
        score: 0,
        matchReasons: buildMatchReasons(source, candidate),
        href: playerPath(candidate.slug),
        compareHref:
          canOfferCompare && isComparePickerEligible(candidate.slug)
            ? compareCanonicalPath(slug, candidate.slug)
            : null,
      }));
  }

  return ranked.map(({ candidate, score }) => ({
    id: candidate.id,
    slug: candidate.slug,
    name: candidate.name,
    shortName: candidate.short_name,
    position: candidate.position,
    positionLabel: formatPosition(candidate.position),
    age: getPlayerAge(candidate.date_of_birth),
    nationality: candidate.nationality,
    imageUrl: candidate.image_url,
    clubName: candidate.current_team?.name ?? null,
    clubLogoUrl: candidate.current_team?.logo_url ?? null,
    competition: candidate.latestCompetition,
    careerGoals: candidate.career?.goals ?? 0,
    score,
    matchReasons: buildMatchReasons(source, candidate),
    href: playerPath(candidate.slug),
    compareHref:
      canOfferCompare && isComparePickerEligible(candidate.slug)
        ? compareCanonicalPath(slug, candidate.slug)
        : null,
  }));
}
