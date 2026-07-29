"use client";

import { useEffect, useState, type ReactNode } from "react";

import { ChartSkeleton } from "@/components/charts/chart-skeleton";

interface ChartMountProps {
  children: ReactNode;
}

/**
 * Client gate: skeleton until mount so Recharts never hydrates mismatched SVG.
 */
export function ChartMount({ children }: ChartMountProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <ChartSkeleton />;
  }

  return children;
}
