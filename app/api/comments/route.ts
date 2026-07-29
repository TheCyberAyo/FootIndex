import { NextResponse } from "next/server";
import { z } from "zod";

import { ServiceError } from "@/services";
import {
  createComment,
  deleteComment,
  listComments,
} from "@/services/comments/comments.service";
import type { CommentEntityType } from "@/types/database";

export const dynamic = "force-dynamic";

const entityTypeSchema = z.enum(["player", "compare", "news", "prediction"]);

const postSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().min(1).max(120),
  body: z.string().min(2).max(1000),
  parentId: z.string().uuid().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    const parsedType = entityTypeSchema.safeParse(entityType);
    if (!parsedType.success || !entityId) {
      return NextResponse.json(
        { error: "entityType and entityId are required." },
        { status: 400 },
      );
    }

    const bundle = await listComments(parsedType.data, entityId);
    return NextResponse.json(bundle);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load comments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = postSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid comment payload." },
        { status: 400 },
      );
    }

    const bundle = await createComment(parsed.data);
    return NextResponse.json(bundle);
  } catch (error) {
    if (error instanceof ServiceError) {
      const status =
        error.code === "AUTH_REQUIRED"
          ? 401
          : error.code === "INVALID_BODY" || error.code === "INVALID_ENTITY"
            ? 400
            : 500;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to create comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const parsedType = entityTypeSchema.safeParse(entityType);

    if (!id || !parsedType.success || !entityId) {
      return NextResponse.json(
        { error: "id, entityType, and entityId are required." },
        { status: 400 },
      );
    }

    const bundle = await deleteComment(
      id,
      parsedType.data as CommentEntityType,
      entityId,
    );
    return NextResponse.json(bundle);
  } catch (error) {
    if (error instanceof ServiceError) {
      const status = error.code === "AUTH_REQUIRED" ? 401 : 500;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to delete comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
