/**
 * TypeScript definitions for Movie Tracker & Insights
 */

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  gender: number; // 1 = Actress, 2 = Actor, 0/3 = Other
  profile_path?: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department?: string;
  profile_path?: string | null;
}

export interface MovieRecord {
  // Primary identifiers
  imdb_id: string; // Const (e.g. tt0469494)
  tmdb_id?: number | null;
  title: string;
  original_title?: string | null;

  // Categorization
  title_type: string; // movie, tvSeries, tvMiniSeries, tvMovie, short, video, tvEpisode
  is_anime: boolean;
  is_series: boolean;
  is_movie: boolean;
  is_episode: boolean;

  // User Profile & Activity Tracking
  your_rating?: number | null;
  date_rated?: string | null;
  is_watched: boolean;
  is_watchlist: boolean;
  date_added_to_watchlist?: string | null;
  lists: string[];
  rewatch_count: number;
  user_review?: string | null;
  user_tags: string[];
  watched_with: string[]; // ['wife', 'family', 'alone', etc.]

  // Baseline IMDb Export Data
  imdb_rating?: number | null;
  imdb_num_votes?: number | null;
  imdb_year?: number | null;
  imdb_runtime_mins?: number | null;
  imdb_directors: string[];
  imdb_genres: string[];

  // TMDB Enriched Metadata
  overview?: string | null;
  tagline?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  year?: number | null;
  runtime?: number | null;
  genres: string[];
  keywords: string[];
  original_language?: string | null;
  spoken_languages: string[];
  production_countries: string[];
  production_companies: string[];
  certification?: string | null;

  // People
  directors: Array<{ id?: number; name: string; profile_path?: string | null; job?: string }>;
  actors: Array<{ id?: number; name: string; character?: string; profile_path?: string | null }>;
  actresses: Array<{ id?: number; name: string; character?: string; profile_path?: string | null }>;

  // Series Specifics
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  episode_run_time?: number | null;
  total_runtime_minutes?: number | null;

  // Section Helpers
  watch_with_wife: boolean;
  watch_with_family: boolean;

  // Pipeline Meta
  enrichment_status: 'pending' | 'enriched' | 'failed' | 'not_found';
  enriched_at?: string | null;
}

export interface StatsSummary {
  totalWatched: number;
  totalMovies: number;
  totalSeries: number;
  totalAnime: number;
  totalEpisodes: number;
  totalWatchlist: number;
  totalHoursSpent: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  topGenres: Array<{ name: string; count: number; avgRating: number }>;
  topActors: Array<{ name: string; count: number; avgRating: number; profile_path?: string }>;
  topActresses: Array<{ name: string; count: number; avgRating: number; profile_path?: string }>;
  topDirectors: Array<{ name: string; count: number; avgRating: number; profile_path?: string }>;
  topStudios: Array<{ name: string; count: number; avgRating: number }>;
  topCountries: Array<{ country: string; count: number }>;
  totalCountriesCount: number;
  ratingDiffVsImdb: {
    avgDiff: number;
    higherCount: number;
    lowerCount: number;
    equalCount: number;
    harshOrGenerous: string;
  };
}
