"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Heart, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommentEntityType } from "@/types/database";
import type { CommentItem, CommentsBundle } from "@/types/domain";

interface CommentsPanelProps {
  entityType: CommentEntityType;
  entityId: string;
  initialComments: CommentItem[];
  nextPath: string;
}

async function fetchComments(
  entityType: CommentEntityType,
  entityId: string,
): Promise<CommentsBundle> {
  const params = new URLSearchParams({ entityType, entityId });
  const response = await fetch(`/api/comments?${params}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to load comments");
  }
  return (await response.json()) as CommentsBundle;
}

export function CommentsPanel({
  entityType,
  entityId,
  initialComments,
  nextPath,
}: CommentsPanelProps) {
  const queryClient = useQueryClient();
  const queryKey = ["comments", entityType, entityId];
  const [authOpen, setAuthOpen] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey,
    queryFn: () => fetchComments(entityType, entityId),
    initialData: {
      comments: initialComments,
      isAuthenticated: false,
    },
    refetchOnMount: "always",
  });

  const postMutation = useMutation({
    mutationFn: async (commentBody: string) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, body: commentBody }),
      });
      const json = (await response.json()) as CommentsBundle & {
        error?: string;
        code?: string;
      };
      if (!response.ok) {
        const err = new Error(json.error ?? "Failed") as Error & {
          code?: string;
        };
        err.code = json.code;
        throw err;
      }
      return json;
    },
    onSuccess: (next) => {
      queryClient.setQueryData(queryKey, next);
      setBody("");
      setError(null);
    },
    onError: (err: Error & { code?: string }) => {
      if (err.code === "AUTH_REQUIRED") {
        setAuthOpen(true);
        return;
      }
      setError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const params = new URLSearchParams({
        id: commentId,
        entityType,
        entityId,
      });
      const response = await fetch(`/api/comments?${params}`, {
        method: "DELETE",
      });
      const json = (await response.json()) as CommentsBundle & {
        error?: string;
        code?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to delete");
      }
      return json;
    },
    onSuccess: (next) => queryClient.setQueryData(queryKey, next),
  });

  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      const json = (await response.json()) as {
        likeCount: number;
        likedByUser: boolean;
        error?: string;
        code?: string;
      };
      if (!response.ok) {
        const err = new Error(json.error ?? "Failed") as Error & {
          code?: string;
        };
        err.code = json.code;
        throw err;
      }
      return { commentId, ...json };
    },
    onSuccess: ({ commentId, likeCount, likedByUser }) => {
      queryClient.setQueryData(queryKey, (prev: CommentsBundle | undefined) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          comments: prev.comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, likeCount, likedByUser }
              : comment,
          ),
        };
      });
    },
    onError: (err: Error & { code?: string }) => {
      if (err.code === "AUTH_REQUIRED") {
        setAuthOpen(true);
      }
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!data.isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    postMutation.mutate(body);
  }

  return (
    <>
      <div className="grid gap-4">
        <GlassCard className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="grid gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="text-foreground/60">Join the debate</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={
                  data.isAuthenticated
                    ? "Share your take…"
                    : "Sign in to comment…"
                }
                className="resize-y rounded-xl border border-border bg-background/40 px-3 py-2 text-foreground outline-none ring-brand focus:ring-2"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                disabled={postMutation.isPending || body.trim().length < 2}
                variant="brand"
              >
                {data.isAuthenticated ? "Post comment" : "Sign in to comment"}
              </Button>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
            </div>
          </form>
        </GlassCard>

        {data.comments.length === 0 ? (
          <p className="text-sm text-foreground/45">
            No comments yet — be the first.
          </p>
        ) : (
          <ul className="grid gap-3">
            {data.comments.map((comment) => (
              <li key={comment.id}>
                <GlassCard className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {comment.authorName}
                      </p>
                      <p className="text-xs text-foreground/40">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {comment.isOwn ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Delete comment"
                        onClick={() => deleteMutation.mutate(comment.id)}
                        className="text-foreground/50 hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/80">
                    {comment.body}
                  </p>
                  <button
                    type="button"
                    onClick={() => likeMutation.mutate(comment.id)}
                    className={cn(
                      "mt-3 inline-flex items-center gap-1.5 text-sm",
                      comment.likedByUser
                        ? "text-brand"
                        : "text-foreground/45 hover:text-foreground",
                    )}
                  >
                    <Heart
                      className={cn(
                        "size-4",
                        comment.likedByUser && "fill-brand",
                      )}
                    />
                    {comment.likeCount}
                  </button>
                </GlassCard>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        nextPath={nextPath}
      />
    </>
  );
}
