"use client";

import { useEffect, useRef } from "react";
import { recordComparisonView } from "@/lib/compare/views";

type ComparisonViewTrackerProps = {
  playerOneId: string;
  playerTwoId: string;
};

export function ComparisonViewTracker({
  playerOneId,
  playerTwoId,
}: ComparisonViewTrackerProps) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) {
      return;
    }
    recorded.current = true;
    void recordComparisonView(playerOneId, playerTwoId);
  }, [playerOneId, playerTwoId]);

  return null;
}
