import React, { useState, useMemo } from 'react';
import { Heart, Sparkles, Film, Flame, Bookmark, Check, Star, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';
import SwipeMatchModal from '../components/couples/SwipeMatchModal';
import RatingPromptModal from '../components/common/RatingPromptModal';

export default function WatchWithWifePage() {
  const { allMovies, setActiveTitle } = useApp();
  const [activeSubFilter, setActiveSubFilter] = useState('watchlist'); // 'watchlist', 'all', 'favorites', 'romcom_list'
  const [isSwipeModalOpen, setIsSwipeModalOpen] = useState(false);
  const [promptMovie, setPromptMovie] = useState(null);

  // Extract wife candidates
  const allWifeTitles = useMemo(() => {
    if (!allMovies) return [];
    return allMovies.filter(m => {
      const genres = m.genres?.length ? m.genres : (m.imdb_genres || []);
      const isRomance = genres.includes('Romance');
      const inWifeLists = m.lists?.includes('Best 100 Romantic Comedy Movies') || m.lists?.includes('Romantic Animated Movies');
      const hasWifeTag = m.watched_with?.includes('wife') || m.watch_with_wife;
      return isRomance || inWifeLists || hasWifeTag;
    });
  }, [allMovies]);

  // Filter based on active tab
  const displayedTitles = useMemo(() => {
    if (activeSubFilter === 'watchlist') {
      return allWifeTitles.filter(m => m.is_watchlist || !m.is_watched);
    }
    if (activeSubFilter === 'favorites') {
      return allWifeTitles.filter(m => m.your_rating >= 9);
    }
    if (activeSubFilter === 'romcom_list') {
      return allWifeTitles.filter(m => m.lists?.includes('Best 100 Romantic Comedy Movies'));
    }
    return allWifeTitles;
  }, [allWifeTitles, activeSubFilter]);

  // Candidate pool for the swipe game (unwatched or high-rated romance)
  const swipeCandidates = useMemo(() => {
    return allWifeTitles
      .filter(m => m.is_watchlist || !m.is_watched || m.your_rating >= 9)
      .slice(0, 35);
  }, [allWifeTitles]);

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Date Night Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/30 bg-gradient-to-r from-rose-950/60 via-cinema-950 to-cinema-900 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-rose-400" />
            <span>Couples Date Night Lounge</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Watch with Wife
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Curated romance, witty romantic comedies, and heartfelt dramas from your collection ({allWifeTitles.length} titles).
          </p>
        </div>

        {/* Launch Swipe Matching Button */}
        <button
          onClick={() => setIsSwipeModalOpen(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 active:scale-95 transition-all self-start md:self-auto flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start Couples Swipe Match</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'watchlist', label: 'Queued to Watch Together', count: allWifeTitles.filter(m => m.is_watchlist || !m.is_watched).length },
          { id: 'all', label: 'All Romance Titles', count: allWifeTitles.length },
          { id: 'favorites', label: 'Our Favorites (★ 9–10)', count: allWifeTitles.filter(m => m.your_rating >= 9).length },
          { id: 'romcom_list', label: 'Best 100 Rom-Coms', count: allWifeTitles.filter(m => m.lists?.includes('Best 100 Romantic Comedy Movies')).length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSubFilter === tab.id
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Titles */}
      {displayedTitles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {displayedTitles.map(movie => (
            <div key={movie.imdb_id} className="relative group">
              <MovieCard movie={movie} />

              {/* Quick Mark Watched overlay button for unwatched titles */}
              {(!movie.is_watched || movie.is_watchlist) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPromptMovie(movie);
                  }}
                  className="absolute bottom-16 right-2 z-10 px-2 py-1 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-[10px] font-bold shadow flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Mark as Watched & Rate"
                >
                  <Check className="w-3 h-3" />
                  <span>Watched</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-3xl border border-white/10 p-8 max-w-md mx-auto">
          <Heart className="w-10 h-10 text-rose-500/50 mx-auto mb-2" />
          <h4 className="text-base font-bold text-white">No titles in this section yet</h4>
          <p className="text-xs text-slate-400 mt-1">
            Add more romantic films or check another filter.
          </p>
        </div>
      )}

      {/* Couples Swipe Game Modal */}
      <SwipeMatchModal
        isOpen={isSwipeModalOpen}
        onClose={() => setIsSwipeModalOpen(false)}
        candidateMovies={swipeCandidates}
        onSelectWinner={(movie) => setActiveTitle(movie)}
      />

      {/* Quick Rating Prompt Modal */}
      <RatingPromptModal
        movie={promptMovie}
        isOpen={Boolean(promptMovie)}
        onClose={() => setPromptMovie(null)}
      />
    </div>
  );
}
