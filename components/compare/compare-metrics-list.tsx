"use client";

import { motion } from "framer-motion";

import { CompareMetricsTable } from "@/components/compare/compare-metrics-table";
import type { CompareMetric } from "@/lib/compare";

interface CompareMetricsListProps {
  metrics: CompareMetric[];
  playerOneName: string;
  playerTwoName: string;
}

/**
 * Client island for subtle entrance — metric math stays on the server.
 */
export function CompareMetricsList({
  metrics,
  playerOneName,
  playerTwoName,
}: CompareMetricsListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <CompareMetricsTable
        metrics={metrics}
        playerOneName={playerOneName}
        playerTwoName={playerTwoName}
      />
    </motion.div>
  );
}
