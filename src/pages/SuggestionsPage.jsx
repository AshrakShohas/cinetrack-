import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Dices, 
  Film, 
  Tv, 
  Heart, 
  Users, 
  Clock, 
  Globe, 
  Check, 
  Flame, 
  SlidersHorizontal,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';
import { 
  MOODS, 
  REGIONS, 
  getMoodSuggestions, 
  getBecauseYouLikedRecommendations, 
  pickRandomTitle 
} from '../services/suggestionsEngine';

export default function SuggestionsPage() {
  const { allMovies, setActiveTitle } = useApp();

  // Engine Mode
  const [engineTab, setEngineTab] = useState('mood'); // 'mood' or 'because_liked'

  // Mood filter states
  const [selectedMoodId, setSelectedMoodId] = useState('feel_good');
  const [mediaType, setMediaType] = useState('all'); // 'all', 'movie', 'series', 'anime'
  const [whoIsWatching, setWhoIsWatching] = useState('all'); // 'all', 'wife', 'family', 'alone'
  const [unwatchedOnly, setUnwatchedOnly] = useState(true);
  const [maxDuration, setMaxDuration] = useState(0); // 0 = any, 90, 120, 150

  // Regional Streaming Badge State (Default: Bangladesh)
  const [selectedRegionCode, setSelectedRegionCode] = useState('BD');

  // "Because You Liked X" Seed Movie
  const [seedMovieId, setSeedMovieId] = useState(() => {
    const top = allMovies?.find(m => m.your_rating === 10);
    return top ? top.imdb_id : '';
  });

  const currentRegion = REGIONS.find(r => r.code === selectedRegionCode) || REGIONS[0];

  // Candidates for "Because You Liked X" seed dropdown (Rated 10 or 9)
  const seedCandidates = useMemo(() => {
    if (!allMovies) return [];
    return allMovies
      .filter(m => m.your_rating >= 9)
      .slice(0, 40);
  }, [allMovies]);

  const activeSeedMovie = useMemo(() => {
    return allMovies?.find(m => m.imdb_id === seedMovieId) || seedCandidates[0];
  }, [allMovies, seedMovieId, seedCandidates]);

  // Compute Mood Suggestions
  const moodSuggestions = useMemo(() => {
    return getMoodSuggestions(allMovies || [], {
      moodId: selectedMoodId,
      mediaType,
      whoIsWatching,
      unwatchedOnly,
      maxDuration: maxDuration > 0 ? maxDuration : null
    });
  }, [allMovies, selectedMoodId, mediaType, whoIsWatching, unwatchedOnly, maxDuration]);

  // Compute "Because You Liked X" Suggestions
  const becauseLikedSuggestions = useMemo(() => {
    if (!activeSeedMovie) return [];
    return getBecauseYouLikedRecommendations(activeSeedMovie, allMovies || [], 18);
  }, [activeSeedMovie, allMovies]);

  // "Tonight's Pick" Random Roll
  const handleRandomPick = () => {
    const pool = engineTab === 'mood' ? moodSuggestions : becauseLikedSuggestions;
    const winner = pickRandomTitle(pool.length > 0 ? pool : allMovies);
    if (winner) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#06B6D4', '#F43F5E']
      });
      setActiveTitle(winner);
    }
  };

  return (
    <div className="space-y-7 pb-24">
      {/* Top Banner with Tonight's Pick & Region Selector */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cinema-gold/30 bg-gradient-to-r from-amber-950/60 via-cinema-950 to-cinema-900 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-cinema-gold text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI & Mood Curation Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Film Discovery & Suggestions
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Tailor movie nights by your exact mood, runtime availability, or discover gems similar to your 10/10 masterpieces.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Region Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 border border-white/15 text-xs text-slate-200">
            <Globe className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedRegionCode}
              onChange={(e) => setSelectedRegionCode(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
            >
              {REGIONS.map(r => (
                <option key={r.code} value={r.code} className="bg-cinema-900 text-white">
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>

          {/* Tonight's Pick Button */}
          <button
            onClick={handleRandomPick}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cinema-gold via-amber-500 to-cinema-rose text-cinema-950 font-black text-xs sm:text-sm shadow-glow-gold hover:opacity-95 active:scale-95 transition-all"
          >
            <Dices className="w-4 h-4 stroke-[2.5]" />
            <span>Tonight's Pick</span>
          </button>
        </div>
      </div>

      {/* Primary Discovery Tabs: Mood Explorer vs. Because You Liked X */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit text-xs font-bold">
        <button
          onClick={() => setEngineTab('mood')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            engineTab === 'mood'
              ? 'bg-gradient-to-r from-cinema-gold to-amber-500 text-cinema-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Mood & Vibes Explorer</span>
        </button>

        <button
          onClick={() => setEngineTab('because_liked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            engineTab === 'because_liked'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-cinema-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>"Because You Liked..." Engine</span>
        </button>
      </div>

      {/* Mode A: Mood & Vibes Explorer */}
      {engineTab === 'mood' && (
        <div className="space-y-6">
          {/* Mood Selector Grid */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              1. What's the Mood Tonight?
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {MOODS.map(m => {
                const isSelected = selectedMoodId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMoodId(m.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white/15 border-cinema-gold shadow-glow-gold/30 -translate-y-1'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                    }`}
                  >
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{m.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{m.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine-Tuning Filters */}
          <div className="p-4 rounded-3xl glass-card border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Format Selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Format:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'movie', label: 'Movies' },
                { id: 'series', label: 'Series' },
                { id: 'anime', label: 'Anime' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setMediaType(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    mediaType === f.id ? 'bg-cinema-gold text-cinema-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Who is Watching */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">With:</span>
              {[
                { id: 'all', label: 'Anyone' },
                { id: 'wife', label: 'Wife', icon: Heart },
                { id: 'family', label: 'Family', icon: Users },
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setWhoIsWatching(w.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
                    whoIsWatching === w.id ? 'bg-cyan-500 text-cinema-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {w.icon && <w.icon className="w-3 h-3" />}
                  <span>{w.label}</span>
                </button>
              ))}
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={maxDuration}
                onChange={(e) => setMaxDuration(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold focus:outline-none"
              >
                <option value={0} className="bg-cinema-900">Any Runtime</option>
                <option value={90} className="bg-cinema-900">&le; 90 mins (Snappy)</option>
                <option value={120} className="bg-cinema-900">&le; 2 hours</option>
                <option value={150} className="bg-cinema-900">&le; 2.5 hours</option>
              </select>
            </div>

            {/* Unwatched Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={unwatchedOnly}
                onChange={(e) => setUnwatchedOnly(e.target.checked)}
                className="rounded accent-cinema-gold"
              />
              <span className="text-slate-300 font-semibold text-xs">
                Unwatched only (Prioritize Watchlist)
              </span>
            </label>
          </div>

          {/* Regional Streaming Info Banner */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <span className="font-bold text-white">{moodSuggestions.length}</span> curated matches
            </span>
            <span className="flex items-center gap-1.5">
              <span>Streaming in {currentRegion.name}:</span>
              <span className="text-cinema-cyan font-bold">{currentRegion.providers.slice(0, 3).join(', ')}</span>
            </span>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {moodSuggestions.slice(0, 36).map(movie => (
              <MovieCard key={movie.imdb_id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {/* Mode B: "Because You Liked..." Engine */}
      {engineTab === 'because_liked' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Choose a Masterpiece Seed to Base Recommendations On:
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={seedMovieId}
                onChange={(e) => setSeedMovieId(e.target.value)}
                className="flex-1 max-w-lg p-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm focus:outline-none"
              >
                {seedCandidates.map(m => (
                  <option key={m.imdb_id} value={m.imdb_id} className="bg-cinema-900 text-white">
                    ★ {m.your_rating} — {m.title} ({m.year || m.imdb_year}) [{m.title_type}]
                  </option>
                ))}
              </select>

              {activeSeedMovie && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Genres:</span>
                  <span className="text-cinema-gold font-semibold">
                    {(activeSeedMovie.genres || activeSeedMovie.imdb_genres || []).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Recommended Because You Loved "{activeSeedMovie?.title}"</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
              {becauseLikedSuggestions.map(movie => (
                <MovieCard key={movie.imdb_id} movie={movie} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
