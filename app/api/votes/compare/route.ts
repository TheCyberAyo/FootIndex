import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthUser } from "@/lib/auth/session";
import { ServiceError } from "@/services";
import { getPlayerProfileBySlug } from "@/services/players/players.service";
import {
  getCompareVoteBundle,
  upsertCompareVote,
} from "@/services/votes/comparison-votes.service";
import { ensureUserProfile } from "@/services/votes/vote-actions";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  playerOne: z.string().min(1),
  playerTwo: z.string().min(1),
});

const bodySchema = z.object({
  playerOneSlug: z.string().min(1),
  playerTwoSlug: z.string().min(1),
  choiceSlug: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      playerOne: url.searchParams.get("playerOne"),
      playerTwo: url.searchParams.get("playerTwo"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Query must include playerOne and playerTwo slugs." },
        { status: 400 },
      );
    }

    const [playerOne, playerTwo, user] = await Promise.all([
      getPlayerProfileBySlug(parsed.data.playerOne),
      getPlayerProfileBySlug(parsed.data.playerTwo),
      getAuthUser(),
    ]);

    if (!playerOne || !playerTwo) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const bundle = await getCompareVoteBundle({
      playerOneId: playerOne.player.id,
      playerOneSlug: playerOne.player.slug,
      playerTwoId: playerTwo.player.id,
      playerTwoSlug: playerTwo.player.slug,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
    });

    return NextResponse.json(bundle);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load comparison votes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Body must be { playerOneSlug, playerTwoSlug, choiceSlug }.",
        },
        { status: 400 },
      );
    }

    const user = await getAuthUser();
    if (!user) {
      throw new ServiceError("Sign in to vote.", "AUTH_REQUIRED");
    }

    const [playerOne, playerTwo] = await Promise.all([
      getPlayerProfileBySlug(parsed.data.playerOneSlug),
      getPlayerProfileBySlug(parsed.data.playerTwoSlug),
    ]);

    if (!playerOne || !playerTwo) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const choicePlayer =
      parsed.data.choiceSlug === playerOne.player.slug
        ? playerOne
        : parsed.data.choiceSlug === playerTwo.player.slug
          ? playerTwo
          : null;

    if (!choicePlayer) {
      throw new ServiceError("Invalid vote choice.", "INVALID_VOTE_CHOICE");
    }

    await ensureUserProfile(user.id, user.email ?? null);
    await upsertCompareVote({
      userId: user.id,
      playerOneId: playerOne.player.id,
      playerTwoId: playerTwo.player.id,
      choicePlayerId: choicePlayer.player.id,
    });

    const bundle = await getCompareVoteBundle({
      playerOneId: playerOne.player.id,
      playerOneSlug: playerOne.player.slug,
      playerTwoId: playerTwo.player.id,
      playerTwoSlug: playerTwo.player.slug,
      userId: user.id,
      userEmail: user.email ?? null,
    });

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
      error instanceof Error ? error.message : "Failed to save comparison vote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
