import {
  PlayerRoutePage,
  generatePlayerRouteMetadata,
} from "@/components/players/player-route-page";

export const revalidate = 60;

export async function generateMetadata() {
  return generatePlayerRouteMetadata("mbappe");
}

export default async function MbappePage() {
  return <PlayerRoutePage slug="mbappe" />;
}
