/**
 * Suggestions & Recommendation Engine
 * Provides mood-based filtering, "Because You Liked X" similarity scoring,
 * streaming provider region metadata, and random pick generator.
 */

export const MOODS = [
  {
    id: 'feel_good',
    name: 'Feel-Good & Uplifting',
    emoji: '😊',
    icon: 'smile',
    color: 'from-amber-400 to-yellow-500',
    genres: ['Comedy', 'Family', 'Animation', 'Adventure'],
    description: 'Heartwarming stories, big laughs, and wholesome triumphs.'
  },
  {
    id: 'romantic',
    name: 'Romantic & Date Night',
    emoji: '❤️',
    icon: 'heart',
    color: 'from-rose-500 to-pink-600',
    genres: ['Romance', 'Comedy', 'Drama'],
    description: 'Charming love stories, witty banter, and deep chemistry.'
  },
  {
    id: 'emotional',
    name: 'Deep & Emotional',
    emoji: '🥺',
    icon: 'droplets',
    color: 'from-blue-500 to-indigo-600',
    genres: ['Drama', 'Biography', 'Music'],
    description: 'Moving, profound, and tearjerker cinematic masterworks.'
  },
  {
    id: 'thrilling',
    name: 'Thrilling & Edge-of-Seat',
    emoji: '⚡',
    icon: 'zap',
    color: 'from-cyan-400 to-blue-600',
    genres: ['Thriller', 'Crime', 'Mystery', 'Action'],
    description: 'High-stakes cat-and-mouse games, twists, and adrenaline.'
  },
  {
    id: 'mind_bending',
    name: 'Mind-Bending & Deep',
    emoji: '🧠',
    icon: 'brain',
    color: 'from-purple-500 to-indigo-700',
    genres: ['Sci-Fi', 'Mystery', 'Thriller', 'Fantasy'],
    description: 'Time loops, philosophical puzzles, and reality-altering concepts.'
  },
  {
    id: 'cozy_relaxed',
    name: 'Cozy & Relaxed',
    emoji: '☕',
    icon: 'coffee',
    color: 'from-emerald-400 to-teal-600',
    genres: ['Animation', 'Comedy', 'Adventure', 'Family'],
    description: 'Gentle, comforting atmospheres perfect for winding down.'
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic & Retro',
    emoji: '📼',
    icon: 'clock',
    color: 'from-amber-500 to-orange-600',
    genres: ['Adventure', 'Fantasy', 'Family', 'Comedy'],
    eras: ['1980s', '1990s', '2000s'],
    description: 'Classic cinema comfort from the golden eras of storytelling.'
  },
  {
    id: 'epic_adventurous',
    name: 'Epic & Grand Scale',
    emoji: '⚔️',
    icon: 'shield',
    color: 'from-red-500 to-amber-600',
    genres: ['Action', 'Adventure', 'Fantasy', 'War', 'History'],
    description: 'Sweeping journeys, grand battles, and legendary heroes.'
  },
  {
    id: 'spooky_dark',
    name: 'Dark & Suspenseful',
    emoji: '🌙',
    icon: 'moon',
    color: 'from-violet-600 to-slate-900',
    genres: ['Horror', 'Mystery', 'Thriller', 'Crime'],
    description: 'Chilling atmospheres, psychological tension, and shadows.'
  }
];

// Streaming services available by region (simulated provider badges)
export const REGIONS = [
  { code: 'BD', name: 'Bangladesh', providers: ['Netflix', 'Prime Video', 'Hoichoi', 'Chorki', 'Disney+ Hotstar'] },
  { code: 'US', name: 'United States', providers: ['Netflix', 'Max', 'Prime Video', 'Hulu', 'Apple TV+', 'Disney+'] },
  { code: 'IN', name: 'India', providers: ['Netflix', 'Prime Video', 'JioCinema', 'Disney+ Hotstar', 'SonyLIV'] },
  { code: 'GB', name: 'United Kingdom', providers: ['Netflix', 'Prime Video', 'BBC iPlayer', 'Now TV', 'Disney+'] },
  { code: 'CA', name: 'Canada', providers: ['Netflix', 'Crave', 'Prime Video', 'Apple TV+'] }
];

/**
 * Filter movies by mood and custom parameters
 */
export function getMoodSuggestions(movies = [], options = {}) {
  const {
    moodId = 'feel_good',
    mediaType = 'all', // 'all', 'movie', 'series', 'anime'
    whoIsWatching = 'all', // 'all', 'wife', 'family', 'alone'
    unwatchedOnly = false,
    maxDuration = null, // e.g. 90, 120, 150
  } = options;

  const mood = MOODS.find(m => m.id === moodId) || MOODS[0];

  return movies.filter(movie => {
    // 1. Unwatched filter
    if (unwatchedOnly && movie.is_watched && !movie.is_watchlist) {
      return false;
    }

    // 2. Media Type filter
    if (mediaType === 'movie' && !movie.is_movie) return false;
    if (mediaType === 'series' && (!movie.is_series || movie.is_anime)) return false;
    if (mediaType === 'anime' && !movie.is_anime) return false;

    // 3. Who is watching filter
    if (whoIsWatching === 'wife' && !movie.watch_with_wife && !movie.lists?.includes('Best 100 Romantic Comedy Movies')) {
      return false;
    }
    if (whoIsWatching === 'family' && !movie.watch_with_family && !movie.lists?.includes('Romantic Animated Movies')) {
      return false;
    }

    // 4. Runtime filter
    const runtime = movie.runtime || movie.imdb_runtime_mins;
    if (maxDuration && runtime && runtime > maxDuration) {
      return false;
    }

    // 5. Mood Genre alignment
    const genres = movie.genres?.length ? movie.genres : (movie.imdb_genres || []);
    const hasGenreMatch = mood.genres.some(g => genres.includes(g));

    return hasGenreMatch;
  }).sort((a, b) => {
    // Prioritize high rating or watchlist items
    const scoreA = (a.your_rating || a.imdb_rating || 0) + (a.is_watchlist ? 1.5 : 0);
    const scoreB = (b.your_rating || b.imdb_rating || 0) + (b.is_watchlist ? 1.5 : 0);
    return scoreB - scoreA;
  });
}

/**
 * Calculates similarity between a selected favorite movie and candidate library titles
 * for the "Because You Liked X" recommendation feature
 */
export function getBecauseYouLikedRecommendations(seedMovie, allMovies = [], limit = 12) {
  if (!seedMovie || !allMovies || allMovies.length === 0) return [];

  const seedGenres = new Set(seedMovie.genres?.length ? seedMovie.genres : (seedMovie.imdb_genres || []));
  const seedDirectors = new Set((seedMovie.imdb_directors || []).map(d => d.trim().toLowerCase()));
  const seedDecade = seedMovie.year ? Math.floor(seedMovie.year / 10) * 10 : null;

  const candidates = allMovies.filter(m => m.imdb_id !== seedMovie.imdb_id);

  const scored = candidates.map(candidate => {
    let score = 0;
    const cGenres = candidate.genres?.length ? candidate.genres : (candidate.imdb_genres || []);
    const cDirectors = (candidate.imdb_directors || []).map(d => d.trim().toLowerCase());
    const cDecade = candidate.year ? Math.floor(candidate.year / 10) * 10 : null;

    // 1. Genre overlap score (up to 40 pts)
    const genreOverlap = cGenres.filter(g => seedGenres.has(g)).length;
    score += genreOverlap * 15;

    // 2. Director match (35 pts bonus)
    if (cDirectors.some(d => seedDirectors.has(d))) {
      score += 35;
    }

    // 3. Same Era/Decade (10 pts)
    if (seedDecade && cDecade === seedDecade) {
      score += 10;
    }

    // 4. Same media type (anime, series, movie)
    if (seedMovie.is_anime && candidate.is_anime) score += 20;
    if (seedMovie.is_series && candidate.is_series) score += 15;

    // 5. Watchlist candidate bonus (recommend things user hasn't watched yet!)
    if (candidate.is_watchlist) score += 15;

    // 6. High user rating or IMDb rating
    if (candidate.your_rating) score += candidate.your_rating * 2;
    else if (candidate.imdb_rating) score += candidate.imdb_rating * 1.5;

    return {
      movie: candidate,
      similarityScore: score
    };
  });

  return scored
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map(item => item.movie);
}

/**
 * Returns a randomized title from candidates with optional seed filters
 */
export function pickRandomTitle(candidates = []) {
  if (!candidates || candidates.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}
