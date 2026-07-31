import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/constants";
import { isValidPlayerSlugFormat } from "@/lib/players/paths";
import { formatPosition } from "@/lib/players/format";
import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  OgBrandMark,
  OgPlayerAvatar,
  ogBackgroundStyle,
} from "@/lib/seo/og-layout";
import { getPlayerProfileBySlug } from "@/services";

export const alt = "Player profile";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

interface PlayerOgImageProps {
  params: Promise<{ slug: string }>;
}

export default async function PlayerOpenGraphImage({ params }: PlayerOgImageProps) {
  const { slug } = await params;

  if (!isValidPlayerSlugFormat(slug)) {
    return new ImageResponse(
      (
        <div style={ogBackgroundStyle()}>
          <OgBrandMark />
        </div>
      ),
      { ...size },
    );
  }

  const profile = await getPlayerProfileBySlug(slug);
  const player = profile?.player;
  const career = profile?.career;

  if (!player) {
    return new ImageResponse(
      (
        <div style={ogBackgroundStyle()}>
          <OgBrandMark />
        </div>
      ),
      { ...size },
    );
  }

  const club = player.current_team?.name ?? "Free agent";
  const goals = career?.goals;
  const assists = career?.assists;

  return new ImageResponse(
    (
      <div
        style={{
          ...ogBackgroundStyle(),
          flexDirection: "row",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 420,
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 32,
            background:
              "linear-gradient(180deg, rgba(108,171,221,0.12), transparent)",
          }}
        >
          <OgPlayerAvatar imageUrl={player.image_url} name={player.name} size={320} />
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 56px 48px 0",
          }}
        >
          <OgBrandMark />
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 58,
              fontWeight: 800,
              letterSpacing: -1,
              lineHeight: 1.05,
              maxWidth: 680,
            }}
          >
            {player.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 28,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            {formatPosition(player.position)} · {player.nationality} · {club}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              gap: 24,
              fontSize: 24,
              color: "rgba(255,255,255,0.88)",
            }}
          >
            {goals != null ? <span>{goals} career goals</span> : null}
            {assists != null ? <span>{assists} assists</span> : null}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {SITE_NAME} · Career stats & comparisons
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
