"use client";

import { Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured } from "@/lib/env";
import type { FavoriteEntityType } from "@/types/domain";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  entityType: FavoriteEntityType;
  playerId?: string;
  teamId?: string;
  playerOneId?: string;
  playerTwoId?: string;
  className?: string;
  size?: "sm" | "default";
}

export function FavoriteButton({
  entityType,
  playerId,
  teamId,
  playerOneId,
  playerTwoId,
  className,
  size = "sm",
}: FavoriteButtonProps) {
  const pathname = usePathname();
  const { user, loading: authLoading, configured } = useAuth();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!configured || !user) {
      setLoading(false);
      setActive(false);
      return;
    }

    let cancelled = false;

    async function loadState() {
      const params = new URLSearchParams({ entityType });
      if (playerId) {
        params.set("playerId", playerId);
      }
      if (teamId) {
        params.set("teamId", teamId);
      }
      if (playerOneId) {
        params.set("playerOneId", playerOneId);
      }
      if (playerTwoId) {
        params.set("playerTwoId", playerTwoId);
      }

      const response = await fetch(`/api/favorites?${params.toString()}`, {
        credentials: "same-origin",
      });

      if (!cancelled && response.ok) {
        const payload = (await response.json()) as { active?: boolean };
        setActive(Boolean(payload.active));
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    setLoading(true);
    void loadState();

    return () => {
      cancelled = true;
    };
  }, [
    configured,
    user,
    entityType,
    playerId,
    teamId,
    playerOneId,
    playerTwoId,
  ]);

  async function toggleFavorite() {
    if (!user) {
      return;
    }

    setLoading(true);

    const method = active ? "DELETE" : "POST";
    const response = await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        entityType,
        playerId,
        teamId,
        playerOneId,
        playerTwoId,
      }),
    });

    if (response.ok) {
      setActive(!active);
    }

    setLoading(false);
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!user) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size={size}
          disabled={authLoading}
          onClick={() => setAuthOpen(true)}
          className={cn(
            "border-white/20 bg-black/30 text-white hover:bg-white/10",
            className,
          )}
        >
          <Heart className="size-4" />
          Save
        </Button>
        <AuthDialog
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          nextPath={pathname}
          intent="favorite"
        />
      </>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={loading}
      onClick={() => void toggleFavorite()}
      className={cn(
        "border-white/20 bg-black/30 text-white hover:bg-white/10",
        active && "border-brand/40 text-brand",
        className,
      )}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn("size-4", active && "fill-current")} />
      {active ? "Saved" : "Save"}
    </Button>
  );
}
