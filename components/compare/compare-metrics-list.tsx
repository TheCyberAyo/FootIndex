"use client";

import { motion } from "framer-motion";

import { CompareMetricRow } from "@/components/compare/compare-metric-row";
import type { CompareMetric } from "@/lib/compare";

interface CompareMetricsListProps {
  metrics: CompareMetric[];
}

/**
 * Client island only for staggered reveal — metric math stays on the server.
 */
export function CompareMetricsList({ metrics }: CompareMetricsListProps) {
  return (
    <div className="grid gap-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.key}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.35,
            delay: Math.min(index * 0.04, 0.28),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <CompareMetricRow metric={metric} />
        </motion.div>
      ))}
    </div>
  );
}
