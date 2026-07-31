"use client";

import { useEffect, useRef } from "react";

import { recordPlayerView } from "@/lib/players/views";

interface PlayerViewTrackerProps {
  playerId: string;
}

/**
 * Records a player profile view once per page visit (client-only).
 */
export function PlayerViewTracker({ playerId }: PlayerViewTrackerProps) {
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (recordedRef.current === playerId) {
      return;
    }

    recordedRef.current = playerId;
    void recordPlayerView(playerId);
  }, [playerId]);

  return null;
}
