import React from 'react';
import { Star, Film, Tv, Sparkles, Heart, Users, Clock, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPosterUrl, getBackdropUrl } from '../services/tmdb';

export default function MovieCard({ movie }) {
  const { setActiveTitle, setActiveBackdrop } = useApp();

  const posterUrl = getPosterUrl(movie.poster_path, 'w500');
  const year = movie.year || movie.imdb_year;
  const rating = movie.your_rating;
  const imdbRating = movie.imdb_rating;

  const handleClick = () => {
    setActiveTitle(movie);
  };

  const handleMouseEnter = () => {
    if (movie.backdrop_path) {
      setActiveBackdrop(getBackdropUrl(movie.backdrop_path));
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden glass-card hover:border-cinema-gold/40 hover:shadow-glow-gold/20 transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.98]"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-poster w-full bg-cinema-900 overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-cinema-900 via-cinema-850 to-cinema-800 text-center">
            {movie.is_series ? (
              <Tv className="w-10 h-10 text-cinema-cyan/50 mb-2" />
            ) : (
              <Film className="w-10 h-10 text-cinema-gold/50 mb-2" />
            )}
            <span className="text-xs font-bold text-slate-300 line-clamp-3">{movie.title}</span>
            <span className="text-[10px] text-slate-500 mt-1">{year || 'IMDb Title'}</span>
          </div>
        )}

        {/* Gradient vignette on bottom of poster */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          {/* Your Rating Badge */}
          {rating ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cinema-950/85 backdrop-blur-md border border-amber-500/40 text-cinema-gold shadow-md">
              <Star className="w-3.5 h-3.5 fill-cinema-gold text-cinema-gold" />
              <span className="text-xs font-black">{rating}</span>
            </div>
          ) : movie.is_watchlist ? (
            <div className="px-2 py-0.5 rounded-lg bg-cinema-950/85 backdrop-blur-md border border-cyan-500/30 text-cinema-cyan text-[11px] font-bold">
              Watchlist
            </div>
          ) : (
            <div />
          )}

          {/* Type Badge (Anime, Series, Movie) */}
          <div className="flex items-center gap-1">
            {movie.is_anime ? (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/90 text-white shadow-sm">
                Anime
              </span>
            ) : movie.is_series ? (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-600/90 text-white shadow-sm">
                Series
              </span>
            ) : null}
          </div>
        </div>

        {/* Watch with Badges */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          {movie.watch_with_wife && (
            <span className="p-1 rounded-md bg-rose-500/80 backdrop-blur-md text-white shadow" title="Watch with Wife">
              <Heart className="w-3 h-3 fill-white" />
            </span>
          )}
          {movie.watch_with_family && (
            <span className="p-1 rounded-md bg-cyan-500/80 backdrop-blur-md text-white shadow" title="Watch with Family">
              <Users className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-3 flex flex-col flex-1 justify-between bg-cinema-950/80">
        <div>
          <h3 className="font-bold text-sm text-white group-hover:text-cinema-gold transition-colors line-clamp-1 leading-snug">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>{year || '—'}</span>
            {imdbRating && (
              <span className="flex items-center gap-1 text-slate-300">
                <span className="text-[10px] text-slate-500 font-semibold">IMDb</span>
                <span className="font-semibold text-slate-200">{imdbRating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Genres Snippet */}
        <div className="mt-2 flex flex-wrap gap-1 overflow-hidden max-h-5">
          {(movie.genres?.length ? movie.genres : (movie.imdb_genres || [])).slice(0, 2).map((g, idx) => (
            <span
              key={idx}
              className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-medium"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
