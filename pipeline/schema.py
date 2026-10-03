"""
Data Schema and Validation Models for Personal Movie Tracker & Insights
Defines structured schemas for IMDb raw parses and TMDB enriched movie/series data.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CastMember(BaseModel):
    id: int
    name: str
    character: Optional[str] = None
    gender: int = 0  # 1 = Female (Actress), 2 = Male (Actor), 0/3 = Other/Unknown
    profile_path: Optional[str] = None


class CrewMember(BaseModel):
    id: int
    name: str
    job: str
    department: Optional[str] = None
    profile_path: Optional[str] = None


class ProductionCompany(BaseModel):
    id: int
    name: str
    logo_path: Optional[str] = None
    origin_country: Optional[str] = None


class MovieRecord(BaseModel):
    # Primary identifiers
    imdb_id: str = Field(description="IMDb Const ID (e.g. tt0469494)")
    tmdb_id: Optional[int] = None
    title: str
    original_title: Optional[str] = None

    # Categorization flags
    title_type: str = "movie"  # movie, tvSeries, tvMiniSeries, tvMovie, short, video, tvEpisode
    is_anime: bool = False
    is_series: bool = False
    is_movie: bool = True
    is_episode: bool = False

    # User Profile & Activity Tracking
    your_rating: Optional[float] = None
    date_rated: Optional[str] = None
    is_watched: bool = False
    is_watchlist: bool = False
    date_added_to_watchlist: Optional[str] = None
    lists: List[str] = Field(default_factory=list)
    rewatch_count: int = 0
    user_review: Optional[str] = None
    user_tags: List[str] = Field(default_factory=list)
    watched_with: List[str] = Field(default_factory=list)  # ['wife', 'family', 'alone', etc.]

    # Baseline IMDb Export Data
    imdb_rating: Optional[float] = None
    imdb_num_votes: Optional[int] = None
    imdb_year: Optional[int] = None
    imdb_runtime_mins: Optional[int] = None
    imdb_directors: List[str] = Field(default_factory=list)
    imdb_genres: List[str] = Field(default_factory=list)

    # TMDB Enriched Metadata
    overview: Optional[str] = None
    tagline: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    year: Optional[int] = None
    runtime: Optional[int] = None
    genres: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    original_language: Optional[str] = None
    spoken_languages: List[str] = Field(default_factory=list)
    production_countries: List[str] = Field(default_factory=list)
    production_companies: List[str] = Field(default_factory=list)
    certification: Optional[str] = None  # Age rating e.g. G, PG, PG-13, R, TV-MA

    # Cast & Crew separated by role and gender
    directors: List[Dict[str, Any]] = Field(default_factory=list)
    actors: List[Dict[str, Any]] = Field(default_factory=list)      # Male cast (gender == 2)
    actresses: List[Dict[str, Any]] = Field(default_factory=list)   # Female cast (gender == 1)

    # Series Specifics
    number_of_seasons: Optional[int] = None
    number_of_episodes: Optional[int] = None
    episode_run_time: Optional[int] = None
    total_runtime_minutes: Optional[int] = None

    # Pre-calculated Section Helpers
    watch_with_wife: bool = False
    watch_with_family: bool = False

    # Pipeline Meta
    enrichment_status: str = "pending"  # pending, enriched, failed, not_found
    enriched_at: Optional[str] = None


class DatasetSummary(BaseModel):
    total_titles: int
    total_watched: int
    total_watchlist: int
    total_movies: int
    total_series: int
    total_anime: int
    total_episodes: int
    lists_breakdown: Dict[str, int]
    generated_at: str
