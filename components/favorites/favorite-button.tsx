"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    async function loadState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) {
        return;
      }

      setSignedIn(Boolean(user));
      if (!user) {
        setLoading(false);
        return;
      }

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

    void loadState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadState();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [entityType, playerId, teamId, playerOneId, playerTwoId]);

  async function toggleFavorite() {
    if (!signedIn) {
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

  if (!signedIn) {
    return (
      <Button
        asChild
        variant="outline"
        size={size}
        className={cn(
          "border-white/20 bg-black/30 text-white hover:bg-white/10",
          className,
        )}
      >
        <Link href="/login">Save</Link>
      </Button>
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
