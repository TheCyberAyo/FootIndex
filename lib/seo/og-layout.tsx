import { BRAND_COLOR, SITE_NAME } from "@/lib/constants";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

export function ogBackgroundStyle(): Record<string, string | number> {
  return {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background:
      "linear-gradient(145deg, #000000 0%, #0a0a0a 55%, #0a1520 100%)",
    color: "#ffffff",
    fontFamily: "sans-serif",
  };
}

export function OgBrandMark() {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 22,
        letterSpacing: 6,
        textTransform: "uppercase",
        color: BRAND_COLOR,
      }}
    >
      {SITE_NAME}
    </div>
  );
}

export function OgPlayerAvatar({
  imageUrl,
  name,
  size = 220,
}: {
  imageUrl: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        borderRadius: "9999px",
        overflow: "hidden",
        border: "4px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 48,
        fontWeight: 700,
        color: "rgba(255,255,255,0.55)",
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          width={size}
          height={size}
          style={{ objectFit: "cover", objectPosition: "top" }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
