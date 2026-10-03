import React from 'react';
import { Clock, History, Calendar, RotateCcw, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function FunMilestones({ funStats }) {
  const { setActiveTitle } = useApp();

  if (!funStats) return null;
  const { longestMovie, oldestMovie, newestMovie, mostRewatched } = funStats;

  const milestones = [
    {
      label: 'Longest Movie Watched',
      icon: Clock,
      color: 'text-amber-400',
      movie: longestMovie,
      value: longestMovie ? `${longestMovie.runtime || longestMovie.imdb_runtime_mins} mins` : '—'
    },
    {
      label: 'Oldest Classic Watched',
      icon: History,
      color: 'text-cyan-400',
      movie: oldestMovie,
      value: oldestMovie ? `Released ${oldestMovie.year || oldestMovie.imdb_year}` : '—'
    },
    {
      label: 'Newest Release Watched',
      icon: Calendar,
      color: 'text-rose-400',
      movie: newestMovie,
      value: newestMovie ? `Released ${newestMovie.year || newestMovie.imdb_year}` : '—'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <Flame className="w-4 h-4 text-cinema-gold" />
        <span>Personal Milestones & Records</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {milestones.map((m, idx) => (
          <div
            key={idx}
            onClick={() => m.movie && setActiveTitle(m.movie)}
            className="cursor-pointer group p-4 rounded-3xl glass-card border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span>{m.label}</span>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>

            <div className="my-1">
              <h4 className="text-base font-extrabold text-white group-hover:text-cinema-gold transition-colors line-clamp-1">
                {m.movie ? m.movie.title : '—'}
              </h4>
              <div className="text-xs font-bold text-cinema-gold mt-1">
                {m.value}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-white/5">
              Tap to view details
            </div>
          </div>
        ))}
      </div>

      {/* Most Rewatched section if available */}
      {mostRewatched && mostRewatched.length > 0 && (
        <div className="p-4 rounded-3xl glass-card border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            <RotateCcw className="w-3.5 h-3.5 text-cinema-gold" />
            <span>Most Rewatched Comfort Titles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {mostRewatched.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveTitle(item)}
                className="cursor-pointer p-3 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-xs transition-colors"
              >
                <span className="font-semibold text-white truncate max-w-[180px]">{item.title}</span>
                <span className="text-cinema-gold font-bold">{item.rewatch_count} rewatches</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
