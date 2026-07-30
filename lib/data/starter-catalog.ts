import type { PlayerPosition } from "@/types/database";

export interface StarterCatalogEntry {
  slug: string;
  apiFootballId: number;
  name: string;
  shortName: string;
  dateOfBirth: string;
  nationality: string;
  heightCm: number;
  position: PlayerPosition;
  bio: string;
}

/**
 * Marquee players to bootstrap the search engine (API-Football IDs verified).
 * Import via POST /api/players/catalog then sync.
 */
export const STARTER_PLAYER_CATALOG: StarterCatalogEntry[] = [
  {
    slug: "lionel-messi",
    apiFootballId: 154,
    name: "Lionel Messi",
    shortName: "Messi",
    dateOfBirth: "1987-06-24",
    nationality: "Argentina",
    heightCm: 170,
    position: "FW",
    bio: "Argentine forward — Inter Miami and Argentina. One of the most prolific playmakers and goalscorers in football history.",
  },
  {
    slug: "cristiano-ronaldo",
    apiFootballId: 874,
    name: "Cristiano Ronaldo",
    shortName: "Ronaldo",
    dateOfBirth: "1985-02-05",
    nationality: "Portugal",
    heightCm: 187,
    position: "FW",
    bio: "Portuguese forward — Al Nassr and Portugal. Elite finisher with a record-breaking club and international career.",
  },
  {
    slug: "harry-kane",
    apiFootballId: 184,
    name: "Harry Kane",
    shortName: "Kane",
    dateOfBirth: "1993-07-28",
    nationality: "England",
    heightCm: 188,
    position: "FW",
    bio: "England captain and elite striker — Bayern Munich and the Three Lions.",
  },
  {
    slug: "mohamed-salah",
    apiFootballId: 306,
    name: "Mohamed Salah",
    shortName: "Salah",
    dateOfBirth: "1992-06-15",
    nationality: "Egypt",
    heightCm: 175,
    position: "FW",
    bio: "Egyptian winger — Liverpool and Egypt. Premier League golden boot regular.",
  },
  {
    slug: "jude-bellingham",
    apiFootballId: 129718,
    name: "Jude Bellingham",
    shortName: "Bellingham",
    dateOfBirth: "2003-06-29",
    nationality: "England",
    heightCm: 186,
    position: "MF",
    bio: "English midfielder — Real Madrid and England. Box-to-box goal threat from central midfield.",
  },
  {
    slug: "vinicius-junior",
    apiFootballId: 762,
    name: "Vinícius Júnior",
    shortName: "Vini Jr",
    dateOfBirth: "2000-07-12",
    nationality: "Brazil",
    heightCm: 176,
    position: "FW",
    bio: "Brazilian winger — Real Madrid and Brazil. Pace, dribbling, and big-game goals.",
  },
  {
    slug: "kevin-de-bruyne",
    apiFootballId: 629,
    name: "Kevin De Bruyne",
    shortName: "De Bruyne",
    dateOfBirth: "1991-06-28",
    nationality: "Belgium",
    heightCm: 181,
    position: "MF",
    bio: "Belgian midfielder — Manchester City and Belgium. Premier League assist machine.",
  },
  {
    slug: "robert-lewandowski",
    apiFootballId: 903,
    name: "Robert Lewandowski",
    shortName: "Lewandowski",
    dateOfBirth: "1988-08-21",
    nationality: "Poland",
    heightCm: 185,
    position: "FW",
    bio: "Polish striker — Barcelona and Poland. Prolific Bundesliga and La Liga goalscorer.",
  },
];
