import React from 'react';
import { Film, Clock, Star, Globe, Tv, Sparkles, Trophy } from 'lucide-react';

export default function HeroMetricCards({ stats }) {
  if (!stats) return null;
  const { overview } = stats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {/* 1. Total Watched */}
      <div className="p-5 rounded-3xl glass-card border border-white/10 hover:border-cinema-gold/30 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>Titles Watched</span>
          <Film className="w-4 h-4 text-cinema-gold group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {overview.totalWatched.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
          <span className="text-amber-400 font-bold">{overview.totalMovies}</span> Movies &bull;
          <span className="text-cyan-400 font-bold">{overview.totalSeries}</span> Series &bull;
          <span className="text-rose-400 font-bold">{overview.totalAnime}</span> Anime
        </div>
      </div>

      {/* 2. Total Watch Time */}
      <div className="p-5 rounded-3xl glass-card border border-white/10 hover:border-cinema-cyan/30 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>Time Invested</span>
          <Clock className="w-4 h-4 text-cinema-cyan group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
          {overview.totalHours.toLocaleString()} <span className="text-sm font-semibold text-slate-400">Hours</span>
        </div>
        <div className="mt-2 text-[11px] text-cyan-300/90 font-medium truncate">
          {overview.formattedDuration}
        </div>
      </div>

      {/* 3. Average Rating & Perfect 10s */}
      <div className="p-5 rounded-3xl glass-card border border-white/10 hover:border-amber-500/30 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>Your Rating Average</span>
          <Star className="w-4 h-4 text-cinema-gold group-hover:scale-110 transition-transform fill-cinema-gold" />
        </div>
        <div className="text-3xl sm:text-4xl font-black text-cinema-gold tracking-tight">
          ★ {overview.averageRating}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-300 font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          <span>{overview.perfect10Count} Perfect 10/10 Masterpieces</span>
        </div>
      </div>

      {/* 4. Global Cinema Reach */}
      <div className="p-5 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/30 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>Countries Explored</span>
          <Globe className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {overview.totalCountriesCount} <span className="text-sm font-semibold text-slate-400">Nations</span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-400 font-medium">
          Global international movie footprint
        </div>
      </div>
    </div>
  );
}
