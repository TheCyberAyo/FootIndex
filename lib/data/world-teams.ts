export type WorldRegion =
  | "europe"
  | "americas"
  | "africa"
  | "asia"
  | "oceania"
  | "all";

export interface WorldTeamSeed {
  apiTeamId: number;
  name: string;
  country: string;
  league: string;
  region: WorldRegion;
}

/**
 * Clubs across continents — one squad fetch each (~1 API call per team).
 * API-Football team IDs (season 2024 squads).
 */
export const WORLD_TEAM_SEEDS: WorldTeamSeed[] = [
  // Europe — Big 5
  { apiTeamId: 50, name: "Manchester City", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 40, name: "Liverpool", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 42, name: "Arsenal", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 541, name: "Real Madrid", country: "Spain", league: "La Liga", region: "europe" },
  { apiTeamId: 529, name: "Barcelona", country: "Spain", league: "La Liga", region: "europe" },
  { apiTeamId: 530, name: "Atletico Madrid", country: "Spain", league: "La Liga", region: "europe" },
  { apiTeamId: 505, name: "Inter", country: "Italy", league: "Serie A", region: "europe" },
  { apiTeamId: 489, name: "AC Milan", country: "Italy", league: "Serie A", region: "europe" },
  { apiTeamId: 496, name: "Juventus", country: "Italy", league: "Serie A", region: "europe" },
  { apiTeamId: 157, name: "Bayern Munich", country: "Germany", league: "Bundesliga", region: "europe" },
  { apiTeamId: 165, name: "Borussia Dortmund", country: "Germany", league: "Bundesliga", region: "europe" },
  { apiTeamId: 85, name: "Paris Saint Germain", country: "France", league: "Ligue 1", region: "europe" },
  { apiTeamId: 81, name: "Marseille", country: "France", league: "Ligue 1", region: "europe" },
  // Europe — other leagues
  { apiTeamId: 194, name: "Ajax", country: "Netherlands", league: "Eredivisie", region: "europe" },
  { apiTeamId: 211, name: "Benfica", country: "Portugal", league: "Primeira Liga", region: "europe" },
  { apiTeamId: 212, name: "Porto", country: "Portugal", league: "Primeira Liga", region: "europe" },
  { apiTeamId: 569, name: "Club Brugge", country: "Belgium", league: "Pro League", region: "europe" },
  { apiTeamId: 247, name: "Celtic", country: "Scotland", league: "Premiership", region: "europe" },
  { apiTeamId: 257, name: "Rangers", country: "Scotland", league: "Premiership", region: "europe" },
  { apiTeamId: 645, name: "Galatasaray", country: "Turkey", league: "Super Lig", region: "europe" },
  { apiTeamId: 611, name: "Fenerbahce", country: "Turkey", league: "Super Lig", region: "europe" },
  { apiTeamId: 327, name: "Bodo/Glimt", country: "Norway", league: "Eliteserien", region: "europe" },
  { apiTeamId: 375, name: "Red Bull Salzburg", country: "Austria", league: "Bundesliga", region: "europe" },
  // Americas
  { apiTeamId: 9568, name: "Inter Miami", country: "USA", league: "MLS", region: "americas" },
  { apiTeamId: 1604, name: "LA Galaxy", country: "USA", league: "MLS", region: "americas" },
  { apiTeamId: 127, name: "Flamengo", country: "Brazil", league: "Serie A", region: "americas" },
  { apiTeamId: 121, name: "Palmeiras", country: "Brazil", league: "Serie A", region: "americas" },
  { apiTeamId: 131, name: "Corinthians", country: "Brazil", league: "Serie A", region: "americas" },
  { apiTeamId: 451, name: "Boca Juniors", country: "Argentina", league: "Primera", region: "americas" },
  { apiTeamId: 435, name: "River Plate", country: "Argentina", league: "Primera", region: "americas" },
  { apiTeamId: 2283, name: "Club America", country: "Mexico", league: "Liga MX", region: "americas" },
  { apiTeamId: 2292, name: "Monterrey", country: "Mexico", league: "Liga MX", region: "americas" },
  { apiTeamId: 1137, name: "Colo Colo", country: "Chile", league: "Primera", region: "americas" },
  // Africa
  { apiTeamId: 146, name: "Al Ahly", country: "Egypt", league: "Premier League", region: "africa" },
  { apiTeamId: 155, name: "Wydad AC", country: "Morocco", league: "Botola", region: "africa" },
  { apiTeamId: 294, name: "Mamelodi Sundowns", country: "South Africa", league: "PSL", region: "africa" },
  { apiTeamId: 1678, name: "Enyimba", country: "Nigeria", league: "NPFL", region: "africa" },
  { apiTeamId: 968, name: "Esperance", country: "Tunisia", league: "Ligue 1", region: "africa" },
  // Asia & Middle East
  { apiTeamId: 2939, name: "Al Nassr", country: "Saudi Arabia", league: "Pro League", region: "asia" },
  { apiTeamId: 2932, name: "Al Hilal", country: "Saudi Arabia", league: "Pro League", region: "asia" },
  { apiTeamId: 287, name: "Urawa Red Diamonds", country: "Japan", league: "J1 League", region: "asia" },
  { apiTeamId: 289, name: "Vissel Kobe", country: "Japan", league: "J1 League", region: "asia" },
  { apiTeamId: 2767, name: "Ulsan HD", country: "South Korea", league: "K League", region: "asia" },
  { apiTeamId: 2768, name: "Jeonbuk Motors", country: "South Korea", league: "K League", region: "asia" },
  { apiTeamId: 943, name: "Melbourne City", country: "Australia", league: "A-League", region: "oceania" },
  { apiTeamId: 2780, name: "Al Ain", country: "UAE", league: "Pro League", region: "asia" },
  { apiTeamId: 10171, name: "Mumbai City", country: "India", league: "ISL", region: "asia" },
];

export function listWorldTeams(region: WorldRegion = "all"): WorldTeamSeed[] {
  if (region === "all") {
    return WORLD_TEAM_SEEDS;
  }
  return WORLD_TEAM_SEEDS.filter((team) => team.region === region);
}
