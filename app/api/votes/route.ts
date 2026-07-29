import { NextResponse } from "next/server";
import { z } from "zod";

import { ServiceError } from "@/services";
import { castVote, getVoteBundle } from "@/services/votes/vote-actions";

export const dynamic = "force-dynamic";

const voteBodySchema = z.object({
  choice: z.enum(["haaland", "mbappe"]),
});

export async function GET() {
  try {
    const bundle = await getVoteBundle();
    return NextResponse.json(bundle);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load votes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = voteBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Body must be { choice: 'haaland' | 'mbappe' }" },
        { status: 400 },
      );
    }

    const bundle = await castVote(parsed.data.choice);
    return NextResponse.json(bundle);
  } catch (error) {
    if (error instanceof ServiceError) {
      const status =
        error.code === "AUTH_REQUIRED"
          ? 401
          : error.code === "INVALID_VOTE_CHOICE"
            ? 400
            : 500;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to save vote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
