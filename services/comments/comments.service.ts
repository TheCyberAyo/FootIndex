import { getAuthUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertNoError, ServiceError } from "@/services/errors";
import { ensureUserProfile } from "@/services/users/ensure-profile";
import type {
  CommentEntityType,
  CommentRow,
  LikeRow,
  UserRow,
} from "@/types/database";
import type { CommentItem, CommentsBundle } from "@/types/domain";

interface CommentWithUser extends CommentRow {
  users: Pick<UserRow, "display_name" | "avatar_url"> | null;
}

const ENTITY_TYPES: CommentEntityType[] = [
  "player",
  "compare",
  "news",
  "prediction",
];

function isEntityType(value: string): value is CommentEntityType {
  return ENTITY_TYPES.includes(value as CommentEntityType);
}

async function loadComments(
  entityType: CommentEntityType,
  entityId: string,
  userId: string | null,
): Promise<CommentItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabasePublicClient();
  const result = await supabase
    .from("comments")
    .select("*, users(display_name, avatar_url)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: true })
    .limit(100);

  assertNoError(result.error, "Failed to load comments");
  const rows = (result.data ?? []) as CommentWithUser[];

  if (rows.length === 0) {
    return [];
  }

  const commentIds = rows.map((row) => row.id);
  const likesResult = await supabase
    .from("likes")
    .select("*")
    .eq("entity_type", "comment")
    .in("entity_id", commentIds);

  assertNoError(likesResult.error, "Failed to load likes");
  const likes = (likesResult.data ?? []) as LikeRow[];

  const likeCountByComment = new Map<string, number>();
  const likedByUser = new Set<string>();

  likes.forEach((like) => {
    likeCountByComment.set(
      like.entity_id,
      (likeCountByComment.get(like.entity_id) ?? 0) + 1,
    );
    if (userId && like.user_id === userId) {
      likedByUser.add(like.entity_id);
    }
  });

  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    entityType: row.entity_type,
    entityId: row.entity_id,
    parentId: row.parent_id,
    createdAt: row.created_at,
    authorName: row.users?.display_name ?? "Fan",
    likeCount: likeCountByComment.get(row.id) ?? 0,
    likedByUser: likedByUser.has(row.id),
    isOwn: Boolean(userId && row.user_id === userId),
  }));
}

/** Public comments — safe for ISR (no cookies). */
export async function listPublicComments(
  entityType: CommentEntityType,
  entityId: string,
): Promise<CommentItem[]> {
  try {
    return await loadComments(entityType, entityId, null);
  } catch {
    return [];
  }
}

export async function listComments(
  entityType: CommentEntityType,
  entityId: string,
): Promise<CommentsBundle> {
  const user = await getAuthUser();

  try {
    const comments = await loadComments(entityType, entityId, user?.id ?? null);
    return { comments, isAuthenticated: Boolean(user) };
  } catch {
    return { comments: [], isAuthenticated: Boolean(user) };
  }
}

export async function createComment(input: {
  entityType: string;
  entityId: string;
  body: string;
  parentId?: string | null;
}): Promise<CommentsBundle> {
  if (!isSupabaseConfigured()) {
    throw new ServiceError(
      "Comments require Supabase configuration.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  if (!isEntityType(input.entityType)) {
    throw new ServiceError("Invalid comment target.", "INVALID_ENTITY");
  }

  const body = input.body.trim();
  if (body.length < 2 || body.length > 1000) {
    throw new ServiceError(
      "Comment must be between 2 and 1000 characters.",
      "INVALID_BODY",
    );
  }

  const user = await getAuthUser();
  if (!user) {
    throw new ServiceError("Sign in to comment.", "AUTH_REQUIRED");
  }

  await ensureUserProfile(user.id, user.email ?? null);

  const supabase = await createSupabaseServerClient();
  const result = await supabase.from("comments").insert({
    user_id: user.id,
    body,
    entity_type: input.entityType,
    entity_id: input.entityId,
    parent_id: input.parentId ?? null,
  });

  assertNoError(result.error, "Failed to create comment");

  return listComments(input.entityType, input.entityId);
}

export async function deleteComment(
  commentId: string,
  entityType: CommentEntityType,
  entityId: string,
): Promise<CommentsBundle> {
  if (!isSupabaseConfigured()) {
    throw new ServiceError(
      "Comments require Supabase configuration.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  const user = await getAuthUser();
  if (!user) {
    throw new ServiceError("Sign in to delete a comment.", "AUTH_REQUIRED");
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  assertNoError(result.error, "Failed to delete comment");

  return listComments(entityType, entityId);
}

export async function toggleCommentLike(commentId: string): Promise<{
  likeCount: number;
  likedByUser: boolean;
}> {
  if (!isSupabaseConfigured()) {
    throw new ServiceError(
      "Likes require Supabase configuration.",
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  const user = await getAuthUser();
  if (!user) {
    throw new ServiceError("Sign in to like a comment.", "AUTH_REQUIRED");
  }

  await ensureUserProfile(user.id, user.email ?? null);

  const supabase = await createSupabaseServerClient();
  const existing = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("entity_type", "comment")
    .eq("entity_id", commentId)
    .maybeSingle();

  assertNoError(existing.error, "Failed to check like");

  if (existing.data) {
    const del = await supabase
      .from("likes")
      .delete()
      .eq("id", (existing.data as { id: string }).id);
    assertNoError(del.error, "Failed to remove like");
  } else {
    const ins = await supabase.from("likes").insert({
      user_id: user.id,
      entity_type: "comment",
      entity_id: commentId,
    });
    assertNoError(ins.error, "Failed to add like");
  }

  const publicClient = createSupabasePublicClient();
  const countResult = await publicClient
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("entity_type", "comment")
    .eq("entity_id", commentId);

  assertNoError(countResult.error, "Failed to count likes");

  return {
    likeCount: countResult.count ?? 0,
    likedByUser: !existing.data,
  };
}
