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
  // Europe — Premier League (remaining top clubs)
  { apiTeamId: 33, name: "Manchester United", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 49, name: "Chelsea", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 47, name: "Tottenham", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 34, name: "Newcastle", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 66, name: "Aston Villa", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 51, name: "Brighton", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 48, name: "West Ham", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 52, name: "Crystal Palace", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 65, name: "Nottingham Forest", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 36, name: "Fulham", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 39, name: "Wolves", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 45, name: "Everton", country: "England", league: "Premier League", region: "europe" },
  { apiTeamId: 55, name: "Brentford", country: "England", league: "Premier League", region: "europe" },
  // Europe — La Liga
  { apiTeamId: 536, name: "Sevilla", country: "Spain", league: "La Liga", region: "europe" },
  { apiTeamId: 548, name: "Real Sociedad", country: "Spain", league: "La Liga", region: "europe" },
  { apiTeamId: 533, name: "Villarreal", country: "Spain", league: "La Liga", region: "europe" },
  { apiTeamId: 715, name: "Girona", country: "Spain", league: "La Liga", region: "europe" },
  // Europe — Serie A
  { apiTeamId: 492, name: "Napoli", country: "Italy", league: "Serie A", region: "europe" },
  { apiTeamId: 497, name: "Roma", country: "Italy", league: "Serie A", region: "europe" },
  { apiTeamId: 487, name: "Lazio", country: "Italy", league: "Serie A", region: "europe" },
  { apiTeamId: 499, name: "Atalanta", country: "Italy", league: "Serie A", region: "europe" },
  { apiTeamId: 502, name: "Fiorentina", country: "Italy", league: "Serie A", region: "europe" },
  { apiTeamId: 504, name: "Bologna", country: "Italy", league: "Serie A", region: "europe" },
  // Europe — Bundesliga
  { apiTeamId: 168, name: "Bayer Leverkusen", country: "Germany", league: "Bundesliga", region: "europe" },
  { apiTeamId: 173, name: "RB Leipzig", country: "Germany", league: "Bundesliga", region: "europe" },
  { apiTeamId: 161, name: "Wolfsburg", country: "Germany", league: "Bundesliga", region: "europe" },
  { apiTeamId: 169, name: "Eintracht Frankfurt", country: "Germany", league: "Bundesliga", region: "europe" },
  { apiTeamId: 172, name: "VfB Stuttgart", country: "Germany", league: "Bundesliga", region: "europe" },
  // Europe — Ligue 1
  { apiTeamId: 91, name: "Monaco", country: "France", league: "Ligue 1", region: "europe" },
  { apiTeamId: 80, name: "Lyon", country: "France", league: "Ligue 1", region: "europe" },
  { apiTeamId: 79, name: "Lille", country: "France", league: "Ligue 1", region: "europe" },
  { apiTeamId: 84, name: "Nice", country: "France", league: "Ligue 1", region: "europe" },
  { apiTeamId: 116, name: "Lens", country: "France", league: "Ligue 1", region: "europe" },
  // Europe — Benelux / Iberia depth
  { apiTeamId: 197, name: "Feyenoord", country: "Netherlands", league: "Eredivisie", region: "europe" },
  { apiTeamId: 192, name: "PSV Eindhoven", country: "Netherlands", league: "Eredivisie", region: "europe" },
  { apiTeamId: 228, name: "Sporting CP", country: "Portugal", league: "Primeira Liga", region: "europe" },
  // Americas — Brazil depth
  { apiTeamId: 124, name: "Santos", country: "Brazil", league: "Serie A", region: "americas" },
  { apiTeamId: 128, name: "Sao Paulo", country: "Brazil", league: "Serie A", region: "americas" },
  { apiTeamId: 598, name: "Fluminense", country: "Brazil", league: "Serie A", region: "americas" },
  // Africa — South Africa PSL
  { apiTeamId: 2690, name: "Orlando Pirates", country: "South Africa", league: "PSL", region: "africa" },
  { apiTeamId: 2699, name: "Kaizer Chiefs", country: "South Africa", league: "PSL", region: "africa" },
  // Asia — Saudi Pro League
  { apiTeamId: 2938, name: "Al Ittihad", country: "Saudi Arabia", league: "Pro League", region: "asia" },
  { apiTeamId: 2929, name: "Al Ahli", country: "Saudi Arabia", league: "Pro League", region: "asia" },
];

/** First index of expansion clubs (2026-07) — use as `offset` when batch-importing new squads. */
export const WORLD_TEAM_EXPANSION_OFFSET = 47;

export function listWorldTeams(region: WorldRegion = "all"): WorldTeamSeed[] {
  if (region === "all") {
    return WORLD_TEAM_SEEDS;
  }
  return WORLD_TEAM_SEEDS.filter((team) => team.region === region);
}
