import React, { useState, useMemo } from 'react';
import { Users, Sparkles, Film, Check, ShieldCheck, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';
import RatingPromptModal from '../components/common/RatingPromptModal';

export default function WatchWithFamilyPage() {
  const { allMovies } = useApp();
  const [activeTab, setActiveTab] = useState('watchlist'); // 'watchlist', 'all', 'animated', 'classics'
  const [certFilter, setCertFilter] = useState('ALL');
  const [promptMovie, setPromptMovie] = useState(null);

  // Extract family safe titles
  const allFamilyTitles = useMemo(() => {
    if (!allMovies) return [];
    return allMovies.filter(m => {
      const cert = (m.certification || '').toUpperCase();
      const isAdult = cert === 'R' || cert === 'NC-17' || cert === 'TV-MA';
      const genres = m.genres?.length ? m.genres : (m.imdb_genres || []);
      const isHorror = genres.includes('Horror');
      if (isAdult || isHorror) return false;

      const isFamilyGenre = genres.includes('Family') || genres.includes('Animation');
      const isSafeCert = ['G', 'PG', 'TV-G', 'TV-PG', 'TV-Y', 'TV-Y7', 'APPROVED'].includes(cert);
      const inFamilyLists = m.lists?.includes('Romantic Animated Movies') || m.watch_with_family;

      return isFamilyGenre || isSafeCert || inFamilyLists;
    });
  }, [allMovies]);

  // Secondary sub-tab filtering
  const filteredTitles = useMemo(() => {
    let list = allFamilyTitles;

    if (activeTab === 'watchlist') {
      list = list.filter(m => m.is_watchlist || !m.is_watched);
    } else if (activeTab === 'animated') {
      list = list.filter(m => {
        const g = m.genres?.length ? m.genres : (m.imdb_genres || []);
        return g.includes('Animation') || m.lists?.includes('Romantic Animated Movies');
      });
    } else if (activeTab === 'high_rated') {
      list = list.filter(m => (m.your_rating || m.imdb_rating) >= 8);
    }

    if (certFilter !== 'ALL') {
      list = list.filter(m => (m.certification || '').toUpperCase() === certFilter);
    }

    return list;
  }, [allFamilyTitles, activeTab, certFilter]);

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-cinema-950 to-cinema-900 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Wholesome All-Ages Hub</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Watch with Family
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Clean, family-friendly animation, adventure, and heartwarming movies safely filtered to exclude graphic content ({allFamilyTitles.length} titles).
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold self-start md:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Strict Age Filter Enabled</span>
        </div>
      </div>

      {/* Primary Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'watchlist', label: 'Queued for Family Night', count: allFamilyTitles.filter(m => m.is_watchlist || !m.is_watched).length },
            { id: 'all', label: 'All Family Safe', count: allFamilyTitles.length },
            { id: 'animated', label: 'Animated Feature Films', count: allFamilyTitles.filter(m => (m.genres || m.imdb_genres || []).includes('Animation')).length },
            { id: 'high_rated', label: 'Family Masterpieces (★ 8+)', count: allFamilyTitles.filter(m => (m.your_rating || m.imdb_rating) >= 8).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
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

        {/* Certification Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="text-slate-400 text-[11px] uppercase mr-1">Rating:</span>
          {['ALL', 'G', 'PG', 'TV-PG'].map(c => (
            <button
              key={c}
              onClick={() => setCertFilter(c)}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                certFilter === c
                  ? 'bg-white/20 text-white border border-white/30 font-extrabold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Titles */}
      {filteredTitles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {filteredTitles.map(movie => (
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
          <Users className="w-10 h-10 text-cyan-500/50 mx-auto mb-2" />
          <h4 className="text-base font-bold text-white">No titles match this filter</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try switching certification or check another tab.
          </p>
        </div>
      )}

      {/* Rating Prompt Modal */}
      <RatingPromptModal
        movie={promptMovie}
        isOpen={Boolean(promptMovie)}
        onClose={() => setPromptMovie(null)}
      />
    </div>
  );
}
