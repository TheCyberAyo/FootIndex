import { ImageResponse } from "next/og";

import { BRAND_COLOR } from "@/lib/constants";

export const alt = "Haaland vs Mbappé — live football stats rivalry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph / social share image — black field, brand City blue VS.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #000000 0%, #0a0a0a 55%, #0a1520 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: BRAND_COLOR,
            marginBottom: 24,
          }}
        >
          Live football stats
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          <span>Haaland</span>
          <span style={{ color: BRAND_COLOR, fontSize: 56 }}>VS</span>
          <span>Mbappé</span>
        </div>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            fontSize: 24,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Goals · Charts · Votes · Predictions
        </div>
      </div>
    ),
    { ...size },
  );
}
