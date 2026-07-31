/**
 * Database row interfaces matching supabase/migrations.
 * Decision: hand-maintained interfaces (PROJECT_RULES) aligned to the
 * Supabase client GenericDatabase shape so `.from()` stays typed.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TeamType = "club" | "national";
export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";
export type PlayerPosition = "GK" | "DF" | "MF" | "FW";
export type VoteChoice = "haaland" | "mbappe";
export type CommentEntityType = "player" | "compare" | "news" | "prediction";
export type LikeEntityType = "comment" | "prediction" | "news";
export type CompetitionType = "league" | "cup" | "international" | "other";

export type TeamRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  country: string;
  team_type: TeamType;
  logo_url: string | null;
  api_football_id: number | null;
  created_at: string;
  updated_at: string;
}

export type PlayerRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  date_of_birth: string;
  nationality: string;
  height_cm: number;
  position: PlayerPosition;
  preferred_foot: string | null;
  bio: string;
  image_url: string | null;
  current_team_id: string | null;
  api_football_id: number | null;
  created_at: string;
  updated_at: string;
}

export type MatchRow = {
  id: string;
  api_football_id: number | null;
  home_team_id: string;
  away_team_id: string;
  competition: string;
  season: string;
  kickoff_at: string;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  venue: string | null;
  created_at: string;
  updated_at: string;
}

export type PlayerStatRow = {
  id: string;
  player_id: string;
  match_id: string;
  team_id: string;
  minutes: number;
  goals: number;
  assists: number;
  shots: number;
  shots_on_target: number;
  passes: number;
  tackles: number;
  yellow_cards: number;
  red_cards: number;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export type SeasonStatRow = {
  id: string;
  player_id: string;
  team_id: string | null;
  season: string;
  competition: string;
  competition_id: string | null;
  season_id: string | null;
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  yellow_cards: number;
  red_cards: number;
  created_at: string;
  updated_at: string;
}

export type CountryRow = {
  id: string;
  name: string;
  code: string | null;
  flag_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CompetitionRow = {
  id: string;
  slug: string;
  name: string;
  api_football_id: number | null;
  country_id: string | null;
  logo_url: string | null;
  competition_type: CompetitionType;
  created_at: string;
  updated_at: string;
}

export type SeasonRow = {
  id: string;
  year: number;
  label: string;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type TransferRow = {
  id: string;
  player_id: string;
  from_team_id: string | null;
  to_team_id: string | null;
  transfer_date: string;
  transfer_type: string | null;
  fee_text: string | null;
  created_at: string;
  updated_at: string;
}

export type ComparisonCacheRow = {
  id: string;
  player_one_id: string;
  player_two_id: string;
  season_filter: string;
  comparison_json: Json;
  created_at: string;
  updated_at: string;
}

export type SearchHistoryRow = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  search_term: string;
  player_id: string | null;
  created_at: string;
}

export type PlayerViewRow = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  player_id: string;
  viewed_at: string;
}

export type AnalyticsVisitorRow = {
  visitor_id: string;
  first_seen_at: string;
  last_seen_at: string;
  visit_count: number;
}

export type SitePageViewRow = {
  id: string;
  session_id: string;
  visitor_id: string;
  user_id: string | null;
  path: string;
  referrer: string | null;
  is_returning: boolean;
  created_at: string;
}

export type SiteNotFoundEventRow = {
  id: string;
  session_id: string | null;
  visitor_id: string | null;
  path: string;
  referrer: string | null;
  created_at: string;
}

export type CareerStatRow = {
  id: string;
  player_id: string;
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  club_goals: number;
  international_goals: number;
  champions_league_goals: number;
  trophies_count: number;
  awards_count: number;
  goals_per_game: number;
  created_at: string;
  updated_at: string;
}

export type AwardRow = {
  id: string;
  player_id: string;
  name: string;
  season: string | null;
  year: number;
  competition: string | null;
  created_at: string;
}

export type TrophyRow = {
  id: string;
  player_id: string;
  team_id: string | null;
  name: string;
  season: string | null;
  year: number;
  created_at: string;
}

export type UserRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type VoteRow = {
  id: string;
  user_id: string;
  choice: VoteChoice;
  created_at: string;
  updated_at: string;
}

export type ComparisonVoteRow = {
  id: string;
  user_id: string;
  player_one_id: string;
  player_two_id: string;
  choice_player_id: string;
  created_at: string;
  updated_at: string;
}

export type PredictionRow = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_scorer_player_id: string | null;
  created_at: string;
  updated_at: string;
}

export type CommentRow = {
  id: string;
  user_id: string;
  body: string;
  entity_type: CommentEntityType;
  entity_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export type LikeRow = {
  id: string;
  user_id: string;
  entity_type: LikeEntityType;
  entity_id: string;
  created_at: string;
}

export type VoteLeaderboardRow = {
  choice: VoteChoice;
  vote_count: number;
  vote_percentage: number | null;
}

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: TeamRow;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          short_name: string;
          country: string;
          team_type: TeamType;
          logo_url?: string | null;
          api_football_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          short_name?: string;
          country?: string;
          team_type?: TeamType;
          logo_url?: string | null;
          api_football_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      players: {
        Row: PlayerRow;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          short_name: string;
          date_of_birth: string;
          nationality: string;
          height_cm: number;
          position: PlayerPosition;
          preferred_foot?: string | null;
          bio?: string;
          image_url?: string | null;
          current_team_id?: string | null;
          api_football_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          short_name?: string;
          date_of_birth?: string;
          nationality?: string;
          height_cm?: number;
          position?: PlayerPosition;
          preferred_foot?: string | null;
          bio?: string;
          image_url?: string | null;
          current_team_id?: string | null;
          api_football_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "players_current_team_id_fkey";
            columns: ["current_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: MatchRow;
        Insert: {
          id?: string;
          api_football_id?: number | null;
          home_team_id: string;
          away_team_id: string;
          competition: string;
          season: string;
          kickoff_at: string;
          status?: MatchStatus;
          home_score?: number | null;
          away_score?: number | null;
          venue?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          api_football_id?: number | null;
          home_team_id?: string;
          away_team_id?: string;
          competition?: string;
          season?: string;
          kickoff_at?: string;
          status?: MatchStatus;
          home_score?: number | null;
          away_score?: number | null;
          venue?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      player_stats: {
        Row: PlayerStatRow;
        Insert: {
          id?: string;
          player_id: string;
          match_id: string;
          team_id: string;
          minutes?: number;
          goals?: number;
          assists?: number;
          shots?: number;
          shots_on_target?: number;
          passes?: number;
          tackles?: number;
          yellow_cards?: number;
          red_cards?: number;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          match_id?: string;
          team_id?: string;
          minutes?: number;
          goals?: number;
          assists?: number;
          shots?: number;
          shots_on_target?: number;
          passes?: number;
          tackles?: number;
          yellow_cards?: number;
          red_cards?: number;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_stats_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_stats_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      season_stats: {
        Row: SeasonStatRow;
        Insert: {
          id?: string;
          player_id: string;
          team_id?: string | null;
          season: string;
          competition: string;
          competition_id?: string | null;
          season_id?: string | null;
          appearances?: number;
          goals?: number;
          assists?: number;
          minutes?: number;
          yellow_cards?: number;
          red_cards?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          team_id?: string | null;
          season?: string;
          competition?: string;
          competition_id?: string | null;
          season_id?: string | null;
          appearances?: number;
          goals?: number;
          assists?: number;
          minutes?: number;
          yellow_cards?: number;
          red_cards?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "season_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "season_stats_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      career_stats: {
        Row: CareerStatRow;
        Insert: {
          id?: string;
          player_id: string;
          appearances?: number;
          goals?: number;
          assists?: number;
          minutes?: number;
          club_goals?: number;
          international_goals?: number;
          champions_league_goals?: number;
          trophies_count?: number;
          awards_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          appearances?: number;
          goals?: number;
          assists?: number;
          minutes?: number;
          club_goals?: number;
          international_goals?: number;
          champions_league_goals?: number;
          trophies_count?: number;
          awards_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "career_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: true;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      awards: {
        Row: AwardRow;
        Insert: {
          id?: string;
          player_id: string;
          name: string;
          season?: string | null;
          year: number;
          competition?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          name?: string;
          season?: string | null;
          year?: number;
          competition?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "awards_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      trophies: {
        Row: TrophyRow;
        Insert: {
          id?: string;
          player_id: string;
          team_id?: string | null;
          name: string;
          season?: string | null;
          year: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          team_id?: string | null;
          name?: string;
          season?: string | null;
          year?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trophies_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trophies_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      countries: {
        Row: CountryRow;
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          flag_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          flag_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      competitions: {
        Row: CompetitionRow;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          api_football_id?: number | null;
          country_id?: string | null;
          logo_url?: string | null;
          competition_type?: CompetitionType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          api_football_id?: number | null;
          country_id?: string | null;
          logo_url?: string | null;
          competition_type?: CompetitionType;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      seasons: {
        Row: SeasonRow;
        Insert: {
          id?: string;
          year: number;
          label: string;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          year?: number;
          label?: string;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transfers: {
        Row: TransferRow;
        Insert: {
          id?: string;
          player_id: string;
          from_team_id?: string | null;
          to_team_id?: string | null;
          transfer_date: string;
          transfer_type?: string | null;
          fee_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          from_team_id?: string | null;
          to_team_id?: string | null;
          transfer_date?: string;
          transfer_type?: string | null;
          fee_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comparison_cache: {
        Row: ComparisonCacheRow;
        Insert: {
          id?: string;
          player_one_id: string;
          player_two_id: string;
          season_filter?: string;
          comparison_json: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_one_id?: string;
          player_two_id?: string;
          season_filter?: string;
          comparison_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comparison_votes: {
        Row: ComparisonVoteRow;
        Insert: {
          id?: string;
          user_id: string;
          player_one_id: string;
          player_two_id: string;
          choice_player_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          player_one_id?: string;
          player_two_id?: string;
          choice_player_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      search_history: {
        Row: SearchHistoryRow;
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          search_term: string;
          player_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          search_term?: string;
          player_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      player_views: {
        Row: PlayerViewRow;
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          player_id: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          player_id?: string;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_views_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_visitors: {
        Row: AnalyticsVisitorRow;
        Insert: {
          visitor_id: string;
          first_seen_at?: string;
          last_seen_at?: string;
          visit_count?: number;
        };
        Update: {
          visitor_id?: string;
          first_seen_at?: string;
          last_seen_at?: string;
          visit_count?: number;
        };
        Relationships: [];
      };
      site_page_views: {
        Row: SitePageViewRow;
        Insert: {
          id?: string;
          session_id: string;
          visitor_id: string;
          user_id?: string | null;
          path: string;
          referrer?: string | null;
          is_returning?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          visitor_id?: string;
          user_id?: string | null;
          path?: string;
          referrer?: string | null;
          is_returning?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      site_not_found_events: {
        Row: SiteNotFoundEventRow;
        Insert: {
          id?: string;
          session_id?: string | null;
          visitor_id?: string | null;
          path: string;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          visitor_id?: string | null;
          path?: string;
          referrer?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: UserRow;
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: VoteRow;
        Insert: {
          id?: string;
          user_id: string;
          choice: VoteChoice;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          choice?: VoteChoice;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      predictions: {
        Row: PredictionRow;
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          predicted_scorer_player_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          predicted_home_score?: number;
          predicted_away_score?: number;
          predicted_scorer_player_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "predictions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "predictions_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: CommentRow;
        Insert: {
          id?: string;
          user_id: string;
          body: string;
          entity_type: CommentEntityType;
          entity_id: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          body?: string;
          entity_type?: CommentEntityType;
          entity_id?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      likes: {
        Row: LikeRow;
        Insert: {
          id?: string;
          user_id: string;
          entity_type: LikeEntityType;
          entity_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: LikeEntityType;
          entity_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      vote_leaderboard: {
        Row: VoteLeaderboardRow;
        Relationships: [];
      };
    };
    Functions: {
      search_players: {
        Args: {
          search_query: string;
          result_limit?: number;
        };
        Returns: {
          id: string;
          slug: string;
          name: string;
          short_name: string;
          date_of_birth: string;
          nationality: string;
          player_position: PlayerPosition;
          image_url: string | null;
          club_name: string | null;
          club_logo_url: string | null;
          competition: string | null;
          search_rank: number | null;
        }[];
      };
    };
    Enums: {
      team_type: TeamType;
      match_status: MatchStatus;
      player_position: PlayerPosition;
      vote_choice: VoteChoice;
      comment_entity_type: CommentEntityType;
      like_entity_type: LikeEntityType;
      competition_type: CompetitionType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

