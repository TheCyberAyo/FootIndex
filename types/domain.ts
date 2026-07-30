import type {
  AwardRow,
  CareerStatRow,
  CommentEntityType,
  MatchRow,
  PlayerPosition,
  PlayerRow,
  PlayerStatRow,
  SeasonStatRow,
  TeamRow,
  TrophyRow,
  VoteChoice,
} from "@/types/database";

/** Domain models used by UI/services (may join related rows). */

export type Team = TeamRow;

export interface Player extends PlayerRow {
  current_team?: Team | null;
}

export type CareerStats = CareerStatRow;

export interface SeasonStats extends SeasonStatRow {
  team?: Team | null;
}

export type Award = AwardRow;

export interface Trophy extends TrophyRow {
  team?: Team | null;
}

export interface Match extends MatchRow {
  home_team?: Team | null;
  away_team?: Team | null;
}

export type PlayerMatchStats = PlayerStatRow;

export interface PlayerProfile {
  player: Player;
  career: CareerStats | null;
  seasons: SeasonStats[];
  awards: Award[];
  trophies: Trophy[];
  transfers: PlayerTransfer[];
}

/** Search autocomplete / results card (PROJECT_SPECIFICATION §56). */
export interface PlayerSearchResult {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  age: number;
  nationality: string;
  position: PlayerPosition;
  positionLabel: string;
  imageUrl: string | null;
  clubName: string | null;
  clubLogoUrl: string | null;
  competition: string | null;
  href: string;
}

export interface ComparisonBundle {
  haaland: PlayerProfile;
  mbappe: PlayerProfile;
}

export interface RankingEntry {
  rank: number;
  player: Player;
  value: number;
  valueLabel: string;
}

export interface CompetitionSummary {
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export interface CompetitionPlayerRow {
  player: Player;
  appearances: number;
  goals: number;
  assists: number;
}

export interface VoteTally {
  choice: VoteChoice;
  voteCount: number;
  votePercentage: number;
}

export interface VoteBundle {
  tallies: VoteTally[];
  totalVotes: number;
  userVote: VoteChoice | null;
  isAuthenticated: boolean;
  userEmail: string | null;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  tags: string[];
  playerSlugs: string[];
}

export interface PredictionSummary {
  match: Match;
  predictionCount: number;
  avgHomeScore: number | null;
  avgAwayScore: number | null;
  userPrediction: {
    id: string;
    predictedHomeScore: number;
    predictedAwayScore: number;
    predictedScorerPlayerId: string | null;
  } | null;
}

export interface CommentItem {
  id: string;
  body: string;
  entityType: CommentEntityType;
  entityId: string;
  parentId: string | null;
  createdAt: string;
  authorName: string;
  likeCount: number;
  likedByUser: boolean;
  isOwn: boolean;
}

export interface CommentsBundle {
  comments: CommentItem[];
  isAuthenticated: boolean;
}

export interface LiveScoreCard {
  match: Match;
  playerStats: PlayerMatchStats | null;
  playerSlug: string | null;
}

export interface PlayerTransfer {
  id: string;
  transferDate: string;
  transferType: string | null;
  feeText: string | null;
  fromTeam: Team | null;
  toTeam: Team | null;
}

export interface PlayerIdentity {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  path: string;
}

export interface PageStubContent {
  title: string;
  description: string;
  highlights: string[];
}
