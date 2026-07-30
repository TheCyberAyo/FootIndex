export {
  listPlayers,
  getPlayerBySlug,
  getPlayerProfileBySlug,
  getFeaturedRivalryProfiles,
  getComparisonProfiles,
} from "@/services/players/players.service";

export {
  importPlayerByApiId,
  seedStarterPlayerCatalog,
} from "@/services/players/player-import.service";

export { importWorldSquads } from "@/services/players/world-import.service";
export type {
  WorldImportOptions,
  WorldImportSummary,
} from "@/services/players/world-import.service";

export {
  getCareerStatsByPlayerId,
  listSeasonStatsByPlayerId,
} from "@/services/stats/stats.service";

export { listTeams, getTeamById, getTeamBySlug, listPlayersByTeamId } from "@/services/teams/teams.service";

export {
  getRanking,
  getTopScorersPreview,
} from "@/services/rankings/rankings.service";

export {
  listCompetitions,
  getCompetitionBySlug,
  listCompetitionLeaderboard,
} from "@/services/competitions/competitions.service";

export {
  listRecentMatches,
  listLiveScoreCards,
  listUpcomingMatches,
} from "@/services/matches/matches.service";

export {
  listPublicPredictionSummaries,
  listPredictionSummaries,
  upsertPrediction,
} from "@/services/predictions/predictions.service";

export {
  listPublicComments,
  listComments,
  createComment,
  deleteComment,
  toggleCommentLike,
} from "@/services/comments/comments.service";

export { ensureUserProfile } from "@/services/users/ensure-profile";

export {
  getVoteLeaderboard,
  getUserVote,
  upsertUserVote,
} from "@/services/votes/votes.service";

export { getVoteBundle, castVote } from "@/services/votes/vote-actions";

export { runSyncJob, assertCronAuthorized, syncPlayerBySlug } from "@/services/sync/sync.service";
export { listSyncablePlayers } from "@/services/sync/syncable-players";
export type { SyncJob, SyncJobResult } from "@/services/sync/sync.service";
export type { SyncablePlayer } from "@/services/sync/syncable-players";

export {
  searchPlayers,
  listTrendingPlayers,
  MIN_QUERY_LENGTH,
  SEARCH_DEFAULT_LIMIT,
} from "@/services/search/search.service";

export {
  recordSearchHistory,
  listRecentSearches,
  listRecentSearchTerms,
} from "@/services/search/search-history.service";

export {
  getCachedComparison,
  invalidateComparisonCacheForPlayer,
} from "@/services/compare/comparison-cache.service";

export { listSimilarPlayers } from "@/services/players/similar-players.service";
export type { SimilarPlayerResult } from "@/services/players/similar-players.service";
export { listTransfersByPlayerId } from "@/services/players/transfers.service";

export {
  ensureCountryByName,
  ensureCompetition,
  ensureSeason,
} from "@/services/reference/reference-entities.service";

export { ServiceError } from "@/services/errors";
