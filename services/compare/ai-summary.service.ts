import { buildComparisonSummary } from "@/lib/compare/summary";
import type { CompareResult } from "@/lib/compare/types";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canonicalComparePlayerIds } from "@/services/votes/comparison-votes.service";
import type { PlayerProfile } from "@/types/domain";

const AI_SUMMARY_TTL_MS = 7 * 86_400_000;

export type ComparisonSummarySource = "ai" | "template";

export interface ComparisonSummaryResult {
  text: string;
  source: ComparisonSummarySource;
}

function getOpenAiApiKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || undefined;
}

async function readCachedAiSummary(
  playerOneId: string,
  playerTwoId: string,
): Promise<string | null> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return null;
  }

  const [canonicalOne, canonicalTwo] = canonicalComparePlayerIds(
    playerOneId,
    playerTwoId,
  );

  try {
    const supabase = createSupabaseAdminClient();
    const result = await supabase
      .from("comparison_cache")
      .select("ai_summary, ai_summary_generated_at")
      .eq("player_one_id", canonicalOne)
      .eq("player_two_id", canonicalTwo)
      .eq("season_filter", "")
      .maybeSingle();

    if (result.error || !result.data?.ai_summary) {
      return null;
    }

    const generatedAt = result.data.ai_summary_generated_at
      ? new Date(result.data.ai_summary_generated_at).getTime()
      : 0;

    if (Date.now() - generatedAt > AI_SUMMARY_TTL_MS) {
      return null;
    }

    return result.data.ai_summary.trim() || null;
  } catch {
    return null;
  }
}

async function writeCachedAiSummary(
  playerOneId: string,
  playerTwoId: string,
  summary: string,
): Promise<void> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return;
  }

  const [canonicalOne, canonicalTwo] = canonicalComparePlayerIds(
    playerOneId,
    playerTwoId,
  );
  const now = new Date().toISOString();

  try {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("comparison_cache")
      .update({
        ai_summary: summary,
        ai_summary_generated_at: now,
      })
      .eq("player_one_id", canonicalOne)
      .eq("player_two_id", canonicalTwo)
      .eq("season_filter", "");
  } catch {
    // Cache optional until migration is applied.
  }
}

async function generateOpenAiSummary(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
  comparison: CompareResult,
  templateFallback: string,
): Promise<string> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return templateFallback;
  }

  const prompt = [
    `Write a concise 2–3 sentence football comparison summary for ${playerOne.player.name} vs ${playerTwo.player.name}.`,
    "Use only the stats provided. No speculation about future performance.",
    `Scoreboard: ${playerOne.player.short_name} ${comparison.scoreboard.playerOneWins}, ${playerTwo.player.short_name} ${comparison.scoreboard.playerTwoWins}, ${comparison.scoreboard.ties} tied categories.`,
    `Career goals: ${playerOne.player.short_name} ${playerOne.career?.goals ?? 0}, ${playerTwo.player.short_name} ${playerTwo.career?.goals ?? 0}.`,
    `UCL goals: ${playerOne.player.short_name} ${playerOne.career?.champions_league_goals ?? 0}, ${playerTwo.player.short_name} ${playerTwo.career?.champions_league_goals ?? 0}.`,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content:
            "You are a factual football stats editor. Plain prose, no markdown, no bullet points.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI returned empty summary");
  }

  return text;
}

export async function getComparisonSummary(
  playerOne: PlayerProfile,
  playerTwo: PlayerProfile,
  comparison: CompareResult,
): Promise<ComparisonSummaryResult> {
  const template = buildComparisonSummary(playerOne, playerTwo, comparison);

  const cached = await readCachedAiSummary(
    playerOne.player.id,
    playerTwo.player.id,
  );
  if (cached) {
    return { text: cached, source: "ai" };
  }

  if (!getOpenAiApiKey()) {
    return { text: template, source: "template" };
  }

  try {
    const generated = await generateOpenAiSummary(
      playerOne,
      playerTwo,
      comparison,
      template,
    );

    await writeCachedAiSummary(
      playerOne.player.id,
      playerTwo.player.id,
      generated,
    );

    return { text: generated, source: "ai" };
  } catch {
    return { text: template, source: "template" };
  }
}
