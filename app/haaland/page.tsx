import {
  PlayerRoutePage,
  generatePlayerRouteMetadata,
} from "@/components/players/player-route-page";

export const revalidate = 60;

export async function generateMetadata() {
  return generatePlayerRouteMetadata("haaland");
}

export default async function HaalandPage() {
  return <PlayerRoutePage slug="haaland" />;
}
