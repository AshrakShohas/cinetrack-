import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  X, 
  Star, 
  Heart, 
  Users, 
  Clock, 
  Calendar, 
  Film, 
  ExternalLink, 
  Plus, 
  Minus, 
  Bookmark, 
  Check, 
  Tag, 
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPosterUrl, getBackdropUrl } from '../services/tmdb';

export default function MovieDetailModal() {
  const { activeTitle, setActiveTitle, handleUpdateMovie } = useApp();

  const [rating, setRating] = useState(activeTitle?.your_rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isWatched, setIsWatched] = useState(activeTitle?.is_watched || false);
  const [isWatchlist, setIsWatchlist] = useState(activeTitle?.is_watchlist || false);
  const [rewatchCount, setRewatchCount] = useState(activeTitle?.rewatch_count || 0);
  const [watchedWith, setWatchedWith] = useState(activeTitle?.watched_with || []);
  const [userReview, setUserReview] = useState(activeTitle?.user_review || '');
  const [tags, setTags] = useState(activeTitle?.user_tags || []);
  const [newTagInput, setNewTagInput] = useState('');

  // Sync state whenever activeTitle changes
  useEffect(() => {
    if (activeTitle) {
      setRating(activeTitle.your_rating || 0);
      setIsWatched(activeTitle.is_watched || false);
      setIsWatchlist(activeTitle.is_watchlist || false);
      setRewatchCount(activeTitle.rewatch_count || 0);
      setWatchedWith(activeTitle.watched_with || []);
      setUserReview(activeTitle.user_review || '');
      setTags(activeTitle.user_tags || []);
    }
  }, [activeTitle]);

  if (!activeTitle) return null;

  const backdropUrl = getBackdropUrl(activeTitle.backdrop_path);
  const posterUrl = getPosterUrl(activeTitle.poster_path);
  const year = activeTitle.year || activeTitle.imdb_year;
  const runtime = activeTitle.runtime || activeTitle.imdb_runtime_mins;
  const imdbRating = activeTitle.imdb_rating;

  // Handle setting a rating
  const onSelectRating = async (r) => {
    setRating(r);
    setIsWatched(true);
    setIsWatchlist(false);

    if (r === 10) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#F43F5E', '#06B6D4', '#10B981']
      });
    }

    await handleUpdateMovie(activeTitle.imdb_id, {
      your_rating: r,
      is_watched: true,
      is_watchlist: false,
      date_rated: activeTitle.date_rated || new Date().toISOString().split('T')[0]
    });
  };

  const toggleWatchStatus = async () => {
    const nextWatched = !isWatched;
    setIsWatched(nextWatched);
    await handleUpdateMovie(activeTitle.imdb_id, {
      is_watched: nextWatched,
      is_watchlist: nextWatched ? false : isWatchlist
    });
  };

  const toggleWatchlistStatus = async () => {
    const nextWatchlist = !isWatchlist;
    setIsWatchlist(nextWatchlist);
    await handleUpdateMovie(activeTitle.imdb_id, {
      is_watchlist: nextWatchlist,
      date_added_to_watchlist: nextWatchlist ? new Date().toISOString().split('T')[0] : null
    });
  };

  const handleRewatchChange = async (delta) => {
    const nextCount = Math.max(0, rewatchCount + delta);
    setRewatchCount(nextCount);
    await handleUpdateMovie(activeTitle.imdb_id, { rewatch_count: nextCount });
  };

  const toggleWatchedWith = async (person) => {
    const next = watchedWith.includes(person)
      ? watchedWith.filter(p => p !== person)
      : [...watchedWith, person];
    setWatchedWith(next);
    await handleUpdateMovie(activeTitle.imdb_id, { watched_with: next });
  };

  const handleSaveReview = async () => {
    await handleUpdateMovie(activeTitle.imdb_id, { user_review: userReview });
  };

  const handleAddTag = async (e) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const val = newTagInput.trim().toLowerCase();
      if (!tags.includes(val)) {
        const nextTags = [...tags, val];
        setTags(nextTags);
        await handleUpdateMovie(activeTitle.imdb_id, { user_tags: nextTags });
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const nextTags = tags.filter(t => t !== tagToRemove);
    setTags(nextTags);
    await handleUpdateMovie(activeTitle.imdb_id, { user_tags: nextTags });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveTitle(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl z-10 my-auto"
        >
          {/* Close button */}
          <button
            onClick={() => setActiveTitle(null)}
            className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Banner with Backdrop */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-cinema-900 flex-shrink-0">
            {backdropUrl ? (
              <img
                src={backdropUrl}
                alt={activeTitle.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-cinema-900 via-cinema-850 to-cinema-800" />
            )}

            {/* Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/60 to-transparent" />

            {/* Title & Key Badges on Backdrop */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-8 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {activeTitle.is_anime ? (
                    <span className="px-2 py-0.5 rounded-md text-xs font-black uppercase bg-rose-500 text-white">
                      Anime
                    </span>
                  ) : activeTitle.is_series ? (
                    <span className="px-2 py-0.5 rounded-md text-xs font-black uppercase bg-cyan-600 text-white">
                      TV Series
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold uppercase bg-white/20 text-slate-200">
                      Feature Film
                    </span>
                  )}

                  {activeTitle.certification && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/10 text-slate-300 border border-white/20">
                      {activeTitle.certification}
                    </span>
                  )}

                  {year && <span className="text-xs text-slate-300 font-medium">{year}</span>}
                  {runtime && <span className="text-xs text-slate-400 font-medium">{runtime} mins</span>}
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                  {activeTitle.title}
                </h2>
                {activeTitle.original_title && activeTitle.original_title !== activeTitle.title && (
                  <p className="text-sm text-slate-300 italic mt-0.5 drop-shadow">
                    Original: {activeTitle.original_title}
                  </p>
                )}
              </div>

              {/* External IMDb Link */}
              <a
                href={`https://www.imdb.com/title/${activeTitle.imdb_id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-xs font-bold border border-yellow-500/30 transition-colors"
              >
                <span>IMDb Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            {/* Interactive User Controls Panel */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
              {/* Rating Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Your Personal Rating
                  </span>
                  <span className="text-base font-extrabold text-cinema-gold">
                    {rating > 0 ? `${rating} / 10` : 'Not Rated'}
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(starNum => (
                    <button
                      key={starNum}
                      onMouseEnter={() => setHoverRating(starNum)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => onSelectRating(starNum)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-transform active:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                          (hoverRating || rating) >= starNum
                            ? 'fill-cinema-gold text-cinema-gold drop-shadow-glow'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggles & Rewatch Counter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                {/* Watched Toggle */}
                <button
                  onClick={toggleWatchStatus}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    isWatched
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isWatched ? 'Marked Watched' : 'Mark as Watched'}</span>
                </button>

                {/* Watchlist Toggle */}
                <button
                  onClick={toggleWatchlistStatus}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    isWatchlist
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>

                {/* Rewatch Counter */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                  <span>Rewatched:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRewatchChange(-1)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-cinema-gold font-bold px-1">{rewatchCount}</span>
                    <button
                      onClick={() => handleRewatchChange(1)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Watched With Tags */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Watched With
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'wife', label: 'Wife', icon: Heart, color: 'text-rose-400' },
                    { id: 'family', label: 'Family', icon: Users, color: 'text-cyan-400' },
                    { id: 'friends', label: 'Friends' },
                    { id: 'alone', label: 'Alone' },
                  ].map(option => {
                    const isSelected = watchedWith.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleWatchedWith(option.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                        }`}
                      >
                        {option.icon && <option.icon className={`w-3.5 h-3.5 ${option.color}`} />}
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Synopsis / Overview */}
            {activeTitle.overview && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Synopsis
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {activeTitle.overview}
                </p>
              </div>
            )}

            {/* IMDb vs Your Rating Comparison Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-cyan-500/10 border border-white/10 flex flex-wrap items-center justify-around gap-4 text-center">
              <div>
                <div className="text-xs text-slate-400">Your Rating</div>
                <div className="text-2xl font-black text-cinema-gold">
                  {activeTitle.your_rating ? `${activeTitle.your_rating}` : '—'}
                </div>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div>
                <div className="text-xs text-slate-400">IMDb Rating</div>
                <div className="text-2xl font-black text-cyan-400">
                  {imdbRating ? imdbRating.toFixed(1) : '—'}
                </div>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div>
                <div className="text-xs text-slate-400">Delta Difference</div>
                <div className="text-2xl font-black text-slate-200">
                  {activeTitle.your_rating && imdbRating
                    ? (activeTitle.your_rating - imdbRating > 0 ? `+${(activeTitle.your_rating - imdbRating).toFixed(1)}` : (activeTitle.your_rating - imdbRating).toFixed(1))
                    : '—'}
                </div>
              </div>
            </div>

            {/* Cast & Crew: Separated by Actors & Actresses */}
            <div className="space-y-4">
              {/* Directors */}
              {activeTitle.directors && activeTitle.directors.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Director(s)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeTitle.directors.map((d, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold text-slate-200">
                        {d.name || d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actors */}
              {activeTitle.actors && activeTitle.actors.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Leading Actors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeTitle.actors.slice(0, 8).map((actor, i) => (
                      <div key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                        <span className="font-semibold text-white">{actor.name}</span>
                        {actor.character && <span className="text-slate-500 ml-1.5 font-normal">as {actor.character}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actresses */}
              {activeTitle.actresses && activeTitle.actresses.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Leading Actresses
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeTitle.actresses.slice(0, 8).map((actress, i) => (
                      <div key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                        <span className="font-semibold text-white">{actress.name}</span>
                        {actress.character && <span className="text-slate-500 ml-1.5 font-normal">as {actress.character}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Personal Review & Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Personal Notes / Review
                </h4>
                <button
                  onClick={handleSaveReview}
                  className="text-xs text-cinema-gold hover:underline font-bold"
                >
                  Save Note
                </button>
              </div>
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Write your personal thoughts, favorite moments, or why you loved it..."
                rows={3}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cinema-gold/50"
              />
            </div>

            {/* Custom Tags */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Custom Tags
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-medium"
                  >
                    <span>#{t}</span>
                    <button onClick={() => handleRemoveTag(t)} className="hover:text-rose-400">
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ Add tag (Press Enter)"
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cinema-gold/50"
                />
              </div>
            </div>

            {/* Lists Affiliation */}
            {activeTitle.lists && activeTitle.lists.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  In Your IMDb Lists
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeTitle.lists.map((l, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-cinema-gold text-xs font-bold">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
