import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Film, Tv, Plus, Check, Star, Globe, Database, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchTMDB, getPosterUrl } from '../services/tmdb';

export default function AddSearchModal() {
  const { isSearchOpen, setIsSearchOpen, allMovies, setActiveTitle, addMovieRecord, showToast } = useApp();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'tmdb'
  const [tmdbResults, setTmdbResults] = useState([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Local library search
  const localResults = React.useMemo(() => {
    if (!query.trim() || !allMovies) return [];
    const q = query.toLowerCase();
    return allMovies.filter(m => {
      return (
        m.title?.toLowerCase().includes(q) ||
        m.original_title?.toLowerCase().includes(q) ||
        (m.imdb_directors || []).some(d => d.toLowerCase().includes(q))
      );
    }).slice(0, 30);
  }, [query, allMovies]);

  // TMDB live search with debounce
  useEffect(() => {
    if (activeTab !== 'tmdb' || !query.trim() || query.length < 2) {
      setTmdbResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingTmdb(true);
      const results = await searchTMDB(query);
      setTmdbResults(results);
      setIsSearchingTmdb(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  if (!isSearchOpen) return null;

  // Add a newly discovered TMDB title to user's library
  const handleAddFromTMDB = async (item, asWatchlist = false) => {
    const isTv = item.media_type === 'tv';
    const newRecord = {
      imdb_id: `tmdb_${item.id}`,
      tmdb_id: item.id,
      title: item.title || item.name,
      original_title: item.original_title || item.original_name,
      title_type: isTv ? 'tvSeries' : 'movie',
      is_movie: !isTv,
      is_series: isTv,
      is_anime: (item.original_language === 'ja' && (item.genre_ids || []).includes(16)),
      is_watched: !asWatchlist,
      is_watchlist: asWatchlist,
      date_added_to_watchlist: asWatchlist ? new Date().toISOString().split('T')[0] : null,
      your_rating: asWatchlist ? null : 8,
      date_rated: asWatchlist ? null : new Date().toISOString().split('T')[0],
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      overview: item.overview,
      year: parseInt((item.release_date || item.first_air_date || '').split('-')[0]) || null,
      imdb_rating: item.vote_average,
      imdb_num_votes: item.vote_count,
      genres: [],
      lists: [],
      rewatch_count: 0,
      user_tags: [],
      watched_with: [],
      enrichment_status: 'enriched'
    };

    await addMovieRecord(newRecord);
    showToast(`Added "${newRecord.title}" to ${asWatchlist ? 'Watchlist' : 'Library'}`);
    setIsSearchOpen(false);
    setActiveTitle(newRecord);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl z-10"
        >
          {/* Search Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <Search className="w-5 h-5 text-cinema-gold" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab === 'library' ? 'Search your 2,914 imported titles...' : 'Discover & search any movie/series on TMDB...'}
              className="flex-1 bg-transparent border-none text-white placeholder-slate-400 text-sm md:text-base focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Source Switcher Tabs */}
          <div className="flex border-b border-white/10 bg-black/20 text-xs font-bold">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'library'
                  ? 'border-b-2 border-cinema-gold text-white bg-white/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>My Library ({localResults.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tmdb')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'tmdb'
                  ? 'border-b-2 border-cinema-rose text-white bg-white/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live TMDB Search</span>
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeTab === 'library' ? (
              localResults.length > 0 ? (
                localResults.map(movie => (
                  <div
                    key={movie.imdb_id}
                    onClick={() => {
                      setActiveTitle(movie);
                      setIsSearchOpen(false);
                    }}
                    className="cursor-pointer group flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cinema-gold/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 rounded-xl overflow-hidden bg-cinema-900 flex-shrink-0">
                        {movie.poster_path ? (
                          <img src={getPosterUrl(movie.poster_path, 'w92')} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <Film className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cinema-gold transition-colors line-clamp-1">
                          {movie.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{movie.year || movie.imdb_year || '—'}</span>
                          <span>&bull;</span>
                          <span className="capitalize">{movie.title_type}</span>
                          {movie.imdb_directors?.length > 0 && (
                            <>
                              <span>&bull;</span>
                              <span className="truncate max-w-[150px]">{movie.imdb_directors[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {movie.your_rating ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-cinema-gold font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-cinema-gold" />
                          <span>{movie.your_rating}</span>
                        </div>
                      ) : movie.is_watchlist ? (
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-semibold">
                          Watchlist
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : query.trim() ? (
                <div className="text-center py-12 text-slate-400">
                  <Film className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No titles found in your library for "{query}".</p>
                  <button
                    onClick={() => setActiveTab('tmdb')}
                    className="mt-3 text-xs text-cinema-gold hover:underline font-bold"
                  >
                    Search on TMDB instead &rarr;
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Type to search across your 2,914 imported movies and shows.
                </div>
              )
            ) : (
              // TMDB Search Tab
              isSearchingTmdb ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Searching TMDB...
                </div>
              ) : tmdbResults.length > 0 ? (
                tmdbResults.map(item => {
                  const existing = allMovies?.find(m => m.tmdb_id === item.id || m.title?.toLowerCase() === (item.title || item.name)?.toLowerCase());
                  const year = (item.release_date || item.first_air_date || '').split('-')[0];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5 gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-16 rounded-xl overflow-hidden bg-cinema-900 flex-shrink-0">
                          {item.poster_path ? (
                            <img src={getPosterUrl(item.poster_path, 'w92')} alt={item.title || item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <Globe className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white line-clamp-1">{item.title || item.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>{year || '—'}</span>
                            <span>&bull;</span>
                            <span className="uppercase text-[10px] font-bold text-slate-400">{item.media_type}</span>
                            {item.vote_average > 0 && (
                              <>
                                <span>&bull;</span>
                                <span className="text-cinema-gold font-bold">★ {item.vote_average.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.overview}</p>
                        </div>
                      </div>

                      {/* Add Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {existing ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>In Library</span>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAddFromTMDB(item, false)}
                              className="px-3 py-1.5 rounded-xl bg-cinema-gold text-cinema-950 text-xs font-bold hover:opacity-90 active:scale-95"
                            >
                              + Watched
                            </button>
                            <button
                              onClick={() => handleAddFromTMDB(item, true)}
                              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold"
                            >
                              + Watchlist
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : query.trim() ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No matching titles found on TMDB.
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Type a movie or series title to find and add it from TMDB.
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
