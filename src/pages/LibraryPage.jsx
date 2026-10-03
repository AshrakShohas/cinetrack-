import React, { useState, useMemo } from 'react';
import { 
  Film, 
  Tv, 
  Sparkles, 
  Star, 
  Filter, 
  LayoutGrid, 
  List, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown,
  Heart,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';
import { getPosterUrl } from '../services/tmdb';

const PAGE_SIZE = 48;

export default function LibraryPage() {
  const { 
    filteredMovies, 
    activeFilter, 
    setActiveFilter, 
    selectedGenre, 
    setSelectedGenre,
    selectedDecade,
    setSelectedDecade,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    stats,
    allMovies,
    setActiveTitle
  } = useApp();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique genres for filter dropdown
  const allGenres = useMemo(() => {
    if (!allMovies) return [];
    const set = new Set();
    allMovies.forEach(m => {
      (m.genres?.length ? m.genres : (m.imdb_genres || [])).forEach(g => set.add(g));
    });
    return Array.from(set).sort();
  }, [allMovies]);

  // Primary filter tabs
  const tabs = [
    { id: 'all', label: 'All Titles', count: stats.total },
    { id: 'watched', label: 'Watched', count: stats.watched },
    { id: 'watchlist', label: 'Watchlist', count: stats.watchlist },
    { id: 'movies', label: 'Movies', count: stats.movies },
    { id: 'series', label: 'TV Shows', count: stats.series },
    { id: 'anime', label: 'Anime', count: stats.anime },
    { id: 'list_cant_miss', label: "Can't Miss", count: 154 },
    { id: 'list_romcom', label: 'Rom-Coms', count: 98 },
    { id: 'list_tv', label: 'Top TV', count: 21 },
    { id: 'list_animated', label: 'Animated', count: 26 },
    { id: 'list_anime', label: 'Anime List', count: 39 },
  ];

  const displayedMovies = filteredMovies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMovies.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  const resetAllFilters = () => {
    setActiveFilter('all');
    setSelectedGenre('');
    setSelectedDecade('');
    setMinRating(0);
    setSortBy('rating_desc');
  };

  const hasActiveFilters = activeFilter !== 'all' || selectedGenre || selectedDecade || minRating > 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Primary Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map(tab => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-cinema-gold via-amber-500 to-cinema-rose text-cinema-950 shadow-glow-gold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                isActive ? 'bg-black/20 text-cinema-950' : 'bg-white/10 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls Bar: Filters, Sorting, Views */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-card border border-white/10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Genre Filter */}
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="" className="bg-cinema-900 text-slate-200">All Genres</option>
            {allGenres.map(g => (
              <option key={g} value={g} className="bg-cinema-900 text-slate-200">{g}</option>
            ))}
          </select>

          {/* Decade Filter */}
          <select
            value={selectedDecade}
            onChange={(e) => {
              setSelectedDecade(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="" className="bg-cinema-900 text-slate-200">All Eras / Decades</option>
            <option value="2020" className="bg-cinema-900 text-slate-200">2020s</option>
            <option value="2010" className="bg-cinema-900 text-slate-200">2010s</option>
            <option value="2000" className="bg-cinema-900 text-slate-200">2000s</option>
            <option value="1990" className="bg-cinema-900 text-slate-200">1990s</option>
            <option value="1980" className="bg-cinema-900 text-slate-200">1980s</option>
            <option value="1970" className="bg-cinema-900 text-slate-200">1970s & Earlier</option>
          </select>

          {/* Min Rating */}
          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(Number(e.target.value));
              setVisibleCount(PAGE_SIZE);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value={0} className="bg-cinema-900 text-slate-200">Any Rating</option>
            <option value={10} className="bg-cinema-900 text-slate-200">★ 10 (Masterpieces)</option>
            <option value={9} className="bg-cinema-900 text-slate-200">★ 9+ (Phenomenal)</option>
            <option value={8} className="bg-cinema-900 text-slate-200">★ 8+ (Great)</option>
            <option value={7} className="bg-cinema-900 text-slate-200">★ 7+ (Good)</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right side: Sorting & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-cinema-gold" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="rating_desc" className="bg-cinema-900 text-slate-200">Your Rating (Highest)</option>
              <option value="imdb_desc" className="bg-cinema-900 text-slate-200">IMDb Rating (Highest)</option>
              <option value="year_desc" className="bg-cinema-900 text-slate-200">Release Year (Newest)</option>
              <option value="year_asc" className="bg-cinema-900 text-slate-200">Release Year (Oldest)</option>
              <option value="title_asc" className="bg-cinema-900 text-slate-200">Title (A &rarr; Z)</option>
              <option value="date_rated_desc" className="bg-cinema-900 text-slate-200">Date Rated (Recent)</option>
            </select>
          </div>

          {/* Grid vs List toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Poster Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Table / List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <span className="font-bold text-white">{displayedMovies.length}</span> of{' '}
          <span className="font-bold text-white">{filteredMovies.length.toLocaleString()}</span> titles
        </span>
      </div>

      {/* Movie Results Display */}
      {displayedMovies.length > 0 ? (
        viewMode === 'grid' ? (
          /* Poster Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {displayedMovies.map(movie => (
              <MovieCard key={movie.imdb_id} movie={movie} />
            ))}
          </div>
        ) : (
          /* Compact Table / List View */
          <div className="rounded-2xl overflow-hidden glass-card border border-white/10 divide-y divide-white/5">
            {displayedMovies.map((movie, idx) => (
              <div
                key={movie.imdb_id}
                onClick={() => setActiveTitle(movie)}
                className="cursor-pointer group flex items-center justify-between p-3 hover:bg-white/5 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-xs text-slate-500 font-mono text-right flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-cinema-900 flex-shrink-0">
                    {movie.poster_path ? (
                      <img src={getPosterUrl(movie.poster_path, 'w92')} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-[10px] text-slate-500">
                        {movie.title[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-cinema-gold transition-colors truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{movie.year || movie.imdb_year || '—'}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{movie.title_type}</span>
                      {movie.imdb_directors?.length > 0 && (
                        <>
                          <span>&bull;</span>
                          <span className="truncate max-w-[200px]">{movie.imdb_directors[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {movie.your_rating ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-cinema-gold font-black text-xs">
                      <Star className="w-3.5 h-3.5 fill-cinema-gold" />
                      <span>{movie.your_rating}</span>
                    </div>
                  ) : movie.is_watchlist ? (
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-semibold">
                      Watchlist
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600 font-medium">—</span>
                  )}

                  {movie.imdb_rating && (
                    <span className="text-xs text-slate-400 font-semibold hidden sm:inline-block w-14 text-right">
                      ★ {movie.imdb_rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-20 glass-card rounded-3xl border border-white/10 p-8 max-w-md mx-auto">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No titles found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query, genre, or decade filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Infinite Scroll / Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wide border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            Load More Titles ({filteredMovies.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
