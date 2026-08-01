import { getServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Serves ads.txt for Google AdSense seller verification.
 * @see https://support.google.com/adsense/answer/12171612
 */
export async function GET() {
  const { adsensePublisherId } = getServerEnv();

  if (!adsensePublisherId) {
    return new Response("# AdSense publisher ID not configured\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const body = `google.com, ${adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
