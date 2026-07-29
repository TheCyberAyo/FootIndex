import {
  CAREER_BASELINE_AS_OF,
  HAALAND_CAREER_BASELINE,
  MBAPPE_CAREER_BASELINE,
  goalsPerGame,
} from "@/lib/data/career-baselines";
import { SEED_MATCH_IDS, SEED_PLAYER_IDS, SEED_TEAM_IDS } from "@/lib/data/seed-ids";
import type {
  Award,
  CareerStats,
  LiveScoreCard,
  Match,
  Player,
  PlayerMatchStats,
  PlayerProfile,
  PlayerSearchResult,
  SeasonStats,
  Team,
  Trophy,
} from "@/types/domain";
import { getPlayerAge, formatPosition } from "@/lib/players/format";
import { playerPath } from "@/lib/players/paths";

const NOW = `${CAREER_BASELINE_AS_OF}T00:00:00.000Z`;

/**
 * In-memory seed mirroring supabase/seed.sql.
 * Career totals come from curated baselines (not Free-plan season rollups).
 */

export const localTeams: Team[] = [
  {
    id: SEED_TEAM_IDS.manchesterCity,
    slug: "manchester-city",
    name: "Manchester City",
    short_name: "Man City",
    country: "England",
    team_type: "club",
    logo_url: null,
    api_football_id: 50,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: SEED_TEAM_IDS.realMadrid,
    slug: "real-madrid",
    name: "Real Madrid",
    short_name: "Real Madrid",
    country: "Spain",
    team_type: "club",
    logo_url: null,
    api_football_id: 541,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: SEED_TEAM_IDS.norway,
    slug: "norway",
    name: "Norway",
    short_name: "Norway",
    country: "Norway",
    team_type: "national",
    logo_url: null,
    api_football_id: 1099,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: SEED_TEAM_IDS.france,
    slug: "france",
    name: "France",
    short_name: "France",
    country: "France",
    team_type: "national",
    logo_url: null,
    api_football_id: 2,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: SEED_TEAM_IDS.dortmund,
    slug: "borussia-dortmund",
    name: "Borussia Dortmund",
    short_name: "Dortmund",
    country: "Germany",
    team_type: "club",
    logo_url: null,
    api_football_id: 165,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: SEED_TEAM_IDS.psg,
    slug: "paris-saint-germain",
    name: "Paris Saint Germain",
    short_name: "PSG",
    country: "France",
    team_type: "club",
    logo_url: null,
    api_football_id: 85,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: SEED_TEAM_IDS.monaco,
    slug: "as-monaco",
    name: "AS Monaco",
    short_name: "Monaco",
    country: "France",
    team_type: "club",
    logo_url: null,
    api_football_id: 91,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: SEED_TEAM_IDS.molde,
    slug: "molde-fk",
    name: "Molde FK",
    short_name: "Molde",
    country: "Norway",
    team_type: "club",
    logo_url: null,
    api_football_id: 348,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: SEED_TEAM_IDS.salzburg,
    slug: "red-bull-salzburg",
    name: "Red Bull Salzburg",
    short_name: "Salzburg",
    country: "Austria",
    team_type: "club",
    logo_url: null,
    api_football_id: 571,
    created_at: NOW,
    updated_at: NOW,
  },
];

function teamById(id: string): Team | null {
  return localTeams.find((team) => team.id === id) ?? null;
}

export const localPlayers: Player[] = [
  {
    id: SEED_PLAYER_IDS.haaland,
    slug: "haaland",
    name: "Erling Haaland",
    short_name: "Haaland",
    date_of_birth: "2000-07-21",
    nationality: "Norway",
    height_cm: 194,
    position: "FW",
    preferred_foot: "Left",
    bio: "Norwegian striker known for elite finishing, physical dominance, and relentless pressing. Star forward for Manchester City and Norway.",
    image_url: null,
    current_team_id: SEED_TEAM_IDS.manchesterCity,
    api_football_id: 1100,
    created_at: NOW,
    updated_at: NOW,
    current_team: teamById(SEED_TEAM_IDS.manchesterCity),
  },
  {
    id: SEED_PLAYER_IDS.mbappe,
    slug: "mbappe",
    name: "Kylian Mbappé",
    short_name: "Mbappé",
    date_of_birth: "1998-12-20",
    nationality: "France",
    height_cm: 178,
    position: "FW",
    preferred_foot: "Right",
    bio: "French forward renowned for world-class pace, dribbling, and big-game scoring. Key attacker for Real Madrid and France.",
    image_url: null,
    current_team_id: SEED_TEAM_IDS.realMadrid,
    api_football_id: 278,
    created_at: NOW,
    updated_at: NOW,
    current_team: teamById(SEED_TEAM_IDS.realMadrid),
  },
];

export const localCareerStats: CareerStats[] = [
  {
    id: "career-haaland",
    player_id: SEED_PLAYER_IDS.haaland,
    ...HAALAND_CAREER_BASELINE,
    goals_per_game: goalsPerGame(HAALAND_CAREER_BASELINE),
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "career-mbappe",
    player_id: SEED_PLAYER_IDS.mbappe,
    ...MBAPPE_CAREER_BASELINE,
    goals_per_game: goalsPerGame(MBAPPE_CAREER_BASELINE),
    created_at: NOW,
    updated_at: NOW,
  },
];

export const localSeasonStats: SeasonStats[] = [
  {
    id: "szn-h-1",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.manchesterCity,
    season: "2025-2026",
    competition: "Premier League",
    appearances: 35,
    goals: 27,
    assists: 8,
    minutes: 2958,
    yellow_cards: 0,
    red_cards: 0,
    created_at: NOW,
    updated_at: NOW,
    team: teamById(SEED_TEAM_IDS.manchesterCity),
  },
  {
    id: "szn-h-2",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.manchesterCity,
    season: "2025-2026",
    competition: "UEFA Champions League",
    appearances: 10,
    goals: 8,
    assists: 0,
    minutes: 820,
    yellow_cards: 0,
    red_cards: 0,
    created_at: NOW,
    updated_at: NOW,
    team: teamById(SEED_TEAM_IDS.manchesterCity),
  },
  {
    id: "szn-h-3",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.norway,
    season: "2026",
    competition: "FIFA World Cup",
    appearances: 5,
    goals: 7,
    assists: 0,
    minutes: 450,
    yellow_cards: 0,
    red_cards: 0,
    created_at: NOW,
    updated_at: NOW,
    team: teamById(SEED_TEAM_IDS.norway),
  },
  {
    id: "szn-m-1",
    player_id: SEED_PLAYER_IDS.mbappe,
    team_id: SEED_TEAM_IDS.realMadrid,
    season: "2025-2026",
    competition: "La Liga",
    appearances: 31,
    goals: 25,
    assists: 5,
    minutes: 2604,
    yellow_cards: 0,
    red_cards: 0,
    created_at: NOW,
    updated_at: NOW,
    team: teamById(SEED_TEAM_IDS.realMadrid),
  },
  {
    id: "szn-m-2",
    player_id: SEED_PLAYER_IDS.mbappe,
    team_id: SEED_TEAM_IDS.realMadrid,
    season: "2025-2026",
    competition: "UEFA Champions League",
    appearances: 11,
    goals: 15,
    assists: 2,
    minutes: 960,
    yellow_cards: 0,
    red_cards: 0,
    created_at: NOW,
    updated_at: NOW,
    team: teamById(SEED_TEAM_IDS.realMadrid),
  },
  {
    id: "szn-m-3",
    player_id: SEED_PLAYER_IDS.mbappe,
    team_id: SEED_TEAM_IDS.france,
    season: "2026",
    competition: "FIFA World Cup",
    appearances: 7,
    goals: 8,
    assists: 2,
    minutes: 630,
    yellow_cards: 0,
    red_cards: 0,
    created_at: NOW,
    updated_at: NOW,
    team: teamById(SEED_TEAM_IDS.france),
  },
];

export const localAwards: Award[] = [
  {
    id: "aw-h-1",
    player_id: SEED_PLAYER_IDS.haaland,
    name: "Premier League Golden Boot",
    season: "2022-2023",
    year: 2023,
    competition: "Premier League",
    created_at: NOW,
  },
  {
    id: "aw-h-2",
    player_id: SEED_PLAYER_IDS.haaland,
    name: "Premier League Golden Boot",
    season: "2023-2024",
    year: 2024,
    competition: "Premier League",
    created_at: NOW,
  },
  {
    id: "aw-h-3",
    player_id: SEED_PLAYER_IDS.haaland,
    name: "Premier League Golden Boot",
    season: "2025-2026",
    year: 2026,
    competition: "Premier League",
    created_at: NOW,
  },
  {
    id: "aw-h-4",
    player_id: SEED_PLAYER_IDS.haaland,
    name: "PFA Players' Player of the Year",
    season: "2022-2023",
    year: 2023,
    competition: "Premier League",
    created_at: NOW,
  },
  {
    id: "aw-h-5",
    player_id: SEED_PLAYER_IDS.haaland,
    name: "UEFA Champions League Top Scorer",
    season: "2020-2021",
    year: 2021,
    competition: "UEFA Champions League",
    created_at: NOW,
  },
  {
    id: "aw-h-6",
    player_id: SEED_PLAYER_IDS.haaland,
    name: "UEFA Men's Player of the Year",
    season: "2022-2023",
    year: 2023,
    competition: "UEFA",
    created_at: NOW,
  },
  {
    id: "aw-m-1",
    player_id: SEED_PLAYER_IDS.mbappe,
    name: "FIFA World Cup Golden Boot",
    season: "2022",
    year: 2022,
    competition: "FIFA World Cup",
    created_at: NOW,
  },
  {
    id: "aw-m-2",
    player_id: SEED_PLAYER_IDS.mbappe,
    name: "FIFA World Cup Golden Boot",
    season: "2026",
    year: 2026,
    competition: "FIFA World Cup",
    created_at: NOW,
  },
  {
    id: "aw-m-3",
    player_id: SEED_PLAYER_IDS.mbappe,
    name: "European Golden Shoe",
    season: "2024-2025",
    year: 2025,
    competition: "European leagues",
    created_at: NOW,
  },
  {
    id: "aw-m-4",
    player_id: SEED_PLAYER_IDS.mbappe,
    name: "Pichichi Trophy",
    season: "2024-2025",
    year: 2025,
    competition: "La Liga",
    created_at: NOW,
  },
  {
    id: "aw-m-5",
    player_id: SEED_PLAYER_IDS.mbappe,
    name: "UEFA Champions League Top Scorer",
    season: "2025-2026",
    year: 2026,
    competition: "UEFA Champions League",
    created_at: NOW,
  },
  {
    id: "aw-m-6",
    player_id: SEED_PLAYER_IDS.mbappe,
    name: "Ligue 1 Player of the Year",
    season: "2023-2024",
    year: 2024,
    competition: "Ligue 1",
    created_at: NOW,
  },
];

export const localTrophies: Trophy[] = [
  {
    id: "tr-h-1",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.salzburg,
    name: "Austrian Bundesliga",
    season: "2018-2019",
    year: 2019,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.salzburg),
  },
  {
    id: "tr-h-2",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.dortmund,
    name: "DFB-Pokal",
    season: "2020-2021",
    year: 2021,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.dortmund),
  },
  {
    id: "tr-h-3",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.manchesterCity,
    name: "Premier League",
    season: "2022-2023",
    year: 2023,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.manchesterCity),
  },
  {
    id: "tr-h-4",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.manchesterCity,
    name: "UEFA Champions League",
    season: "2022-2023",
    year: 2023,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.manchesterCity),
  },
  {
    id: "tr-h-5",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.manchesterCity,
    name: "FA Cup",
    season: "2022-2023",
    year: 2023,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.manchesterCity),
  },
  {
    id: "tr-h-6",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.manchesterCity,
    name: "Premier League",
    season: "2023-2024",
    year: 2024,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.manchesterCity),
  },
  {
    id: "tr-h-7",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.manchesterCity,
    name: "FIFA Club World Cup",
    season: "2023",
    year: 2023,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.manchesterCity),
  },
  {
    id: "tr-h-8",
    player_id: SEED_PLAYER_IDS.haaland,
    team_id: SEED_TEAM_IDS.manchesterCity,
    name: "FA Cup",
    season: "2025-2026",
    year: 2026,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.manchesterCity),
  },
  {
    id: "tr-m-1",
    player_id: SEED_PLAYER_IDS.mbappe,
    team_id: SEED_TEAM_IDS.monaco,
    name: "Ligue 1",
    season: "2016-2017",
    year: 2017,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.monaco),
  },
  {
    id: "tr-m-2",
    player_id: SEED_PLAYER_IDS.mbappe,
    team_id: SEED_TEAM_IDS.psg,
    name: "Ligue 1",
    season: "2023-2024",
    year: 2024,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.psg),
  },
  {
    id: "tr-m-3",
    player_id: SEED_PLAYER_IDS.mbappe,
    team_id: SEED_TEAM_IDS.france,
    name: "FIFA World Cup",
    season: "2018",
    year: 2018,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.france),
  },
  {
    id: "tr-m-4",
    player_id: SEED_PLAYER_IDS.mbappe,
    team_id: SEED_TEAM_IDS.france,
    name: "UEFA Nations League",
    season: "2020-2021",
    year: 2021,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.france),
  },
  {
    id: "tr-m-5",
    player_id: SEED_PLAYER_IDS.mbappe,
    team_id: SEED_TEAM_IDS.realMadrid,
    name: "UEFA Super Cup",
    season: "2024",
    year: 2024,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.realMadrid),
  },
  {
    id: "tr-m-6",
    player_id: SEED_PLAYER_IDS.mbappe,
    team_id: SEED_TEAM_IDS.realMadrid,
    name: "FIFA Intercontinental Cup",
    season: "2024",
    year: 2024,
    created_at: NOW,
    team: teamById(SEED_TEAM_IDS.realMadrid),
  },
];

function finishedMatch(
  id: string,
  homeTeamId: string,
  awayTeamId: string,
  competition: string,
  kickoffAt: string,
  homeScore: number,
  awayScore: number,
  venue: string,
): Match {
  return {
    id,
    api_football_id: null,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    competition,
    season: "2025-2026",
    kickoff_at: kickoffAt,
    status: "finished",
    home_score: homeScore,
    away_score: awayScore,
    venue,
    created_at: NOW,
    updated_at: NOW,
    home_team: teamById(homeTeamId),
    away_team: teamById(awayTeamId),
  };
}

function appearanceStats(
  id: string,
  playerId: string,
  matchId: string,
  teamId: string,
  goals: number,
  assists: number,
  rating: number,
): PlayerMatchStats {
  return {
    id,
    player_id: playerId,
    match_id: matchId,
    team_id: teamId,
    minutes: 90,
    goals,
    assists,
    shots: Math.max(goals + 2, 3),
    shots_on_target: Math.max(goals + 1, 2),
    passes: 28,
    tackles: 0,
    yellow_cards: 0,
    red_cards: 0,
    rating,
    created_at: NOW,
    updated_at: NOW,
  };
}

/** 5 Haaland + 5 Mbappé appearances, plus upcoming fixtures (no stats) for predictions. */
export const localMatches: Match[] = [
  finishedMatch(
    SEED_MATCH_IDS.haaland1,
    SEED_TEAM_IDS.manchesterCity,
    SEED_TEAM_IDS.dortmund,
    "UEFA Champions League",
    "2026-05-10T19:00:00.000Z",
    2,
    1,
    "Etihad Stadium",
  ),
  finishedMatch(
    SEED_MATCH_IDS.haaland2,
    SEED_TEAM_IDS.manchesterCity,
    SEED_TEAM_IDS.dortmund,
    "Premier League",
    "2026-05-03T16:30:00.000Z",
    3,
    0,
    "Etihad Stadium",
  ),
  finishedMatch(
    SEED_MATCH_IDS.haaland3,
    SEED_TEAM_IDS.dortmund,
    SEED_TEAM_IDS.manchesterCity,
    "Premier League",
    "2026-04-26T14:00:00.000Z",
    1,
    2,
    "Signal Iduna Park",
  ),
  finishedMatch(
    SEED_MATCH_IDS.haaland4,
    SEED_TEAM_IDS.manchesterCity,
    SEED_TEAM_IDS.psg,
    "UEFA Champions League",
    "2026-04-15T19:00:00.000Z",
    1,
    1,
    "Etihad Stadium",
  ),
  finishedMatch(
    SEED_MATCH_IDS.haaland5,
    SEED_TEAM_IDS.manchesterCity,
    SEED_TEAM_IDS.psg,
    "Premier League",
    "2026-04-05T15:00:00.000Z",
    4,
    1,
    "Etihad Stadium",
  ),
  finishedMatch(
    SEED_MATCH_IDS.mbappe1,
    SEED_TEAM_IDS.realMadrid,
    SEED_TEAM_IDS.psg,
    "UEFA Champions League",
    "2026-05-11T19:00:00.000Z",
    3,
    2,
    "Santiago Bernabéu",
  ),
  finishedMatch(
    SEED_MATCH_IDS.mbappe2,
    SEED_TEAM_IDS.realMadrid,
    SEED_TEAM_IDS.psg,
    "La Liga",
    "2026-05-04T20:00:00.000Z",
    2,
    0,
    "Santiago Bernabéu",
  ),
  finishedMatch(
    SEED_MATCH_IDS.mbappe3,
    SEED_TEAM_IDS.psg,
    SEED_TEAM_IDS.realMadrid,
    "La Liga",
    "2026-04-27T17:15:00.000Z",
    1,
    3,
    "Parc des Princes",
  ),
  finishedMatch(
    SEED_MATCH_IDS.mbappe4,
    SEED_TEAM_IDS.realMadrid,
    SEED_TEAM_IDS.dortmund,
    "UEFA Champions League",
    "2026-04-16T19:00:00.000Z",
    2,
    1,
    "Santiago Bernabéu",
  ),
  finishedMatch(
    SEED_MATCH_IDS.mbappe5,
    SEED_TEAM_IDS.dortmund,
    SEED_TEAM_IDS.realMadrid,
    "La Liga",
    "2026-04-06T15:15:00.000Z",
    0,
    2,
    "Santiago Bernabéu",
  ),
  {
    id: SEED_MATCH_IDS.cityUpcoming,
    api_football_id: null,
    home_team_id: SEED_TEAM_IDS.manchesterCity,
    away_team_id: SEED_TEAM_IDS.dortmund,
    competition: "Premier League",
    season: "2025-2026",
    kickoff_at: "2026-08-15T16:30:00.000Z",
    status: "scheduled",
    home_score: null,
    away_score: null,
    venue: "Etihad Stadium",
    created_at: NOW,
    updated_at: NOW,
    home_team: teamById(SEED_TEAM_IDS.manchesterCity),
    away_team: teamById(SEED_TEAM_IDS.dortmund),
  },
  {
    id: SEED_MATCH_IDS.madridUpcoming,
    api_football_id: null,
    home_team_id: SEED_TEAM_IDS.realMadrid,
    away_team_id: SEED_TEAM_IDS.psg,
    competition: "La Liga",
    season: "2025-2026",
    kickoff_at: "2026-08-22T19:00:00.000Z",
    status: "scheduled",
    home_score: null,
    away_score: null,
    venue: "Santiago Bernabéu",
    created_at: NOW,
    updated_at: NOW,
    home_team: teamById(SEED_TEAM_IDS.realMadrid),
    away_team: teamById(SEED_TEAM_IDS.psg),
  },
];

export const localPlayerMatchStats: PlayerMatchStats[] = [
  appearanceStats("ps-h-1", SEED_PLAYER_IDS.haaland, SEED_MATCH_IDS.haaland1, SEED_TEAM_IDS.manchesterCity, 2, 0, 8.7),
  appearanceStats("ps-h-2", SEED_PLAYER_IDS.haaland, SEED_MATCH_IDS.haaland2, SEED_TEAM_IDS.manchesterCity, 2, 1, 8.4),
  appearanceStats("ps-h-3", SEED_PLAYER_IDS.haaland, SEED_MATCH_IDS.haaland3, SEED_TEAM_IDS.manchesterCity, 1, 0, 7.9),
  appearanceStats("ps-h-4", SEED_PLAYER_IDS.haaland, SEED_MATCH_IDS.haaland4, SEED_TEAM_IDS.manchesterCity, 1, 0, 7.6),
  appearanceStats("ps-h-5", SEED_PLAYER_IDS.haaland, SEED_MATCH_IDS.haaland5, SEED_TEAM_IDS.manchesterCity, 3, 0, 9.1),
  appearanceStats("ps-m-1", SEED_PLAYER_IDS.mbappe, SEED_MATCH_IDS.mbappe1, SEED_TEAM_IDS.realMadrid, 2, 1, 8.8),
  appearanceStats("ps-m-2", SEED_PLAYER_IDS.mbappe, SEED_MATCH_IDS.mbappe2, SEED_TEAM_IDS.realMadrid, 1, 1, 8.2),
  appearanceStats("ps-m-3", SEED_PLAYER_IDS.mbappe, SEED_MATCH_IDS.mbappe3, SEED_TEAM_IDS.realMadrid, 2, 0, 8.5),
  appearanceStats("ps-m-4", SEED_PLAYER_IDS.mbappe, SEED_MATCH_IDS.mbappe4, SEED_TEAM_IDS.realMadrid, 1, 0, 7.8),
  appearanceStats("ps-m-5", SEED_PLAYER_IDS.mbappe, SEED_MATCH_IDS.mbappe5, SEED_TEAM_IDS.realMadrid, 1, 1, 8.0),
];

export function buildLocalPlayerProfile(slug: string): PlayerProfile | null {
  const player = localPlayers.find((item) => item.slug === slug);
  if (!player) {
    return null;
  }

  return {
    player,
    career:
      localCareerStats.find((item) => item.player_id === player.id) ?? null,
    seasons: localSeasonStats.filter((item) => item.player_id === player.id),
    awards: localAwards.filter((item) => item.player_id === player.id),
    trophies: localTrophies.filter((item) => item.player_id === player.id),
  };
}

export function buildLocalLiveScoreCards(): LiveScoreCard[] {
  const cards: LiveScoreCard[] = [];
  for (const stats of localPlayerMatchStats) {
    const match = localMatches.find((item) => item.id === stats.match_id);
    const player = localPlayers.find((item) => item.id === stats.player_id);
    if (!match || !player) {
      continue;
    }
    cards.push({
      match,
      playerStats: stats,
      playerSlug: player.slug,
    });
  }
  return cards;
}

function latestCompetitionForPlayer(playerId: string): string | null {
  const seasons = localSeasonStats
    .filter((row) => row.player_id === playerId)
    .sort((a, b) => b.season.localeCompare(a.season));
  return seasons[0]?.competition ?? null;
}

function mapLocalPlayerToSearchResult(player: Player): PlayerSearchResult {
  return {
    id: player.id,
    slug: player.slug,
    name: player.name,
    shortName: player.short_name,
    age: getPlayerAge(player.date_of_birth),
    nationality: player.nationality,
    position: player.position,
    positionLabel: formatPosition(player.position),
    imageUrl: player.image_url,
    clubName: player.current_team?.name ?? null,
    clubLogoUrl: player.current_team?.logo_url ?? null,
    competition: latestCompetitionForPlayer(player.id),
    href: playerPath(player.slug),
  };
}

export function buildLocalPlayerSearchResults(): PlayerSearchResult[] {
  return localPlayers.map(mapLocalPlayerToSearchResult);
}

export function searchLocalPlayers(
  query: string,
  limit: number,
): PlayerSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) {
    return [];
  }

  return localPlayers
    .filter((player) => {
      const haystack = [
        player.name,
        player.short_name,
        player.nationality,
        player.slug,
        player.current_team?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    })
    .slice(0, limit)
    .map(mapLocalPlayerToSearchResult);
}
