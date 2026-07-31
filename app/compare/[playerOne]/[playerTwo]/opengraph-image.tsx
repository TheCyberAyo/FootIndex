import { ImageResponse } from "next/og";

import { isValidCompareSlugPair } from "@/lib/compare/paths";
import { SITE_NAME } from "@/lib/constants";
import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  OgBrandMark,
  OgPlayerAvatar,
  ogBackgroundStyle,
} from "@/lib/seo/og-layout";
import { getPlayerProfileBySlug } from "@/services";

export const alt = "Player comparison";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

interface CompareOgImageProps {
  params: Promise<{ playerOne: string; playerTwo: string }>;
}

export default async function CompareOpenGraphImage({
  params,
}: CompareOgImageProps) {
  const { playerOne: playerOneSlug, playerTwo: playerTwoSlug } = await params;

  if (!isValidCompareSlugPair(playerOneSlug, playerTwoSlug)) {
    return new ImageResponse(
      (
        <div style={ogBackgroundStyle()}>
          <OgBrandMark />
        </div>
      ),
      { ...size },
    );
  }

  const [playerOneProfile, playerTwoProfile] = await Promise.all([
    getPlayerProfileBySlug(playerOneSlug),
    getPlayerProfileBySlug(playerTwoSlug),
  ]);

  if (!playerOneProfile || !playerTwoProfile) {
    return new ImageResponse(
      (
        <div style={ogBackgroundStyle()}>
          <OgBrandMark />
        </div>
      ),
      { ...size },
    );
  }

  const playerOne = playerOneProfile.player;
  const playerTwo = playerTwoProfile.player;
  const goalsOne = playerOneProfile.career?.goals;
  const goalsTwo = playerTwoProfile.career?.goals;

  return new ImageResponse(
    (
      <div
        style={{
          ...ogBackgroundStyle(),
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <OgBrandMark />
        <div
          style={{
            display: "flex",
            marginTop: 36,
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <OgPlayerAvatar imageUrl={playerOne.image_url} name={playerOne.name} size={200} />
            <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>
              {playerOne.short_name}
            </div>
            {goalsOne != null ? (
              <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.65)" }}>
                {goalsOne} goals
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: 8,
              color: "#6CABDD",
            }}
          >
            VS
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <OgPlayerAvatar imageUrl={playerTwo.image_url} name={playerTwo.name} size={200} />
            <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>
              {playerTwo.short_name}
            </div>
            {goalsTwo != null ? (
              <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.65)" }}>
                {goalsTwo} goals
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 28,
            color: "rgba(255,255,255,0.72)",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {playerOne.name} vs {playerTwo.name} — career stats, trophies, and head-to-head
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 20,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {SITE_NAME}
        </div>
      </div>
    ),
    { ...size },
  );
}
