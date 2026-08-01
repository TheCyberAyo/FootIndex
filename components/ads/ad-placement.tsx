import { getAdSlotId, type AdSlotKey } from "@/lib/ads/config";
import { getPublicEnv } from "@/lib/env";

import { AdSlot } from "@/components/ads/ad-slot";

interface AdPlacementProps {
  slotKey: AdSlotKey;
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
  minHeight?: number;
}

/**
 * Server wrapper that resolves env-based slot IDs. Renders nothing when AdSense is unset.
 */
export function AdPlacement({
  slotKey,
  format = "auto",
  className,
  minHeight,
}: AdPlacementProps) {
  const { adsenseClientId } = getPublicEnv();
  const slotId = getAdSlotId(slotKey);

  if (!adsenseClientId || !slotId) {
    return null;
  }

  return (
    <AdSlot
      clientId={adsenseClientId}
      slotId={slotId}
      format={format}
      className={className}
      minHeight={minHeight}
    />
  );
}
