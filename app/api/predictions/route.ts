import { NextResponse } from "next/server";
import { z } from "zod";

import { ServiceError } from "@/services";
import {
  listPredictionSummaries,
  upsertPrediction,
} from "@/services/predictions/predictions.service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  matchId: z.string().uuid(),
  predictedHomeScore: z.number().int().min(0).max(20),
  predictedAwayScore: z.number().int().min(0).max(20),
  predictedScorerPlayerId: z.string().uuid().nullable().optional(),
});

export async function GET() {
  try {
    const bundle = await listPredictionSummaries();
    return NextResponse.json(bundle);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load predictions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid prediction payload." },
        { status: 400 },
      );
    }

    const summaries = await upsertPrediction(parsed.data);
    return NextResponse.json({
      summaries,
      isAuthenticated: true,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      const status =
        error.code === "AUTH_REQUIRED"
          ? 401
          : error.code === "INVALID_SCORE"
            ? 400
            : 500;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to save prediction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
