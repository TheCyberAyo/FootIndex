import { NextResponse } from "next/server";
import { z } from "zod";

import { ServiceError } from "@/services";
import { toggleCommentLike } from "@/services/comments/comments.service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  commentId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "commentId (uuid) is required." },
        { status: 400 },
      );
    }

    const result = await toggleCommentLike(parsed.data.commentId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      const status = error.code === "AUTH_REQUIRED" ? 401 : 500;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to toggle like";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
