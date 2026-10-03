import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trophy, Film, Clock, Star, Share2, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getPosterUrl } from '../../services/tmdb';

export default function YearInReviewModal({ isOpen, onClose }) {
  const { allMovies } = useApp();
  const [selectedYear, setSelectedYear] = useState('2026');

  // Filter movies for selected year
  const yearData = useMemo(() => {
    if (!allMovies) return null;

    const inYear = allMovies.filter(m => {
      if (selectedYear === 'all') return m.is_watched || m.your_rating;
      const rateYear = m.date_rated ? m.date_rated.split('-')[0] : null;
      const relYear = m.year ? String(m.year) : null;
      return rateYear === selectedYear || relYear === selectedYear;
    });

    let totalMins = 0;
    const rated = inYear.filter(m => m.your_rating);
    let ratingSum = 0;

    inYear.forEach(m => {
      const rt = m.runtime || m.imdb_runtime_mins || 105;
      totalMins += rt * (1 + (m.rewatch_count || 0));
    });

    rated.forEach(m => {
      ratingSum += m.your_rating;
    });

    const avg = rated.length > 0 ? (ratingSum / rated.length).toFixed(1) : '—';
    const topPicks = [...inYear]
      .filter(m => m.your_rating)
      .sort((a, b) => (b.your_rating || 0) - (a.your_rating || 0) || (b.imdb_rating || 0) - (a.imdb_rating || 0))
      .slice(0, 3);

    // Top Genre
    const genreCounts = {};
    inYear.forEach(m => {
      (m.genres?.length ? m.genres : (m.imdb_genres || [])).forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });
    const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Drama';

    return {
      count: inYear.length,
      hours: Math.round(totalMins / 60),
      avgRating: avg,
      topPicks,
      topGenre
    };
  }, [allMovies, selectedYear]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl overflow-hidden glass-panel border border-cinema-gold/30 shadow-2xl z-10 p-6 sm:p-8 space-y-6 bg-gradient-to-b from-cinema-900 via-cinema-950 to-black"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Year Selector */}
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2 text-cinema-gold text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Cinema Wrapped</span>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-none"
            >
              <option value="2026" className="bg-cinema-900">2026 Review</option>
              <option value="2025" className="bg-cinema-900">2025 Review</option>
              <option value="2024" className="bg-cinema-900">2024 Review</option>
              <option value="2023" className="bg-cinema-900">2023 Review</option>
              <option value="all" className="bg-cinema-900">All-Time Wrapped</option>
            </select>
          </div>

          {/* Wrapped Poster Header */}
          <div className="text-center space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cinema-gold via-rose-400 to-cyan-400 bg-clip-text text-transparent">
              {selectedYear === 'all' ? 'All-Time' : selectedYear} In Review
            </h2>
            <p className="text-xs text-slate-400">
              Personal Film Reel & Milestones
            </p>
          </div>

          {/* Stats Bento Box */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-white">{yearData?.count || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Watched</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-cyan-400">{yearData?.hours || 0}h</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Hours Spent</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-cinema-gold">★ {yearData?.avgRating}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Avg Rating</div>
            </div>
          </div>

          {/* Top Films of the Year */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-cinema-gold" />
              <span>Top Films of {selectedYear === 'all' ? 'Your Lifetime' : selectedYear}</span>
            </h4>

            <div className="space-y-2">
              {yearData?.topPicks.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-black text-cinema-gold">#{idx + 1}</span>
                    <span className="text-xs font-bold text-white truncate">{m.title}</span>
                  </div>
                  <div className="text-cinema-gold font-black text-xs">
                    ★ {m.your_rating}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Genre & Signature Trait */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-cyan-500/10 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Top Genre</div>
              <div className="font-extrabold text-white text-sm mt-0.5">{yearData?.topGenre}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Cinema Archetype</div>
              <div className="font-extrabold text-cinema-gold text-sm mt-0.5">Discerning Auteur</div>
            </div>
          </div>

          {/* Share instructions */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400">
              Take a screenshot to share your cinematic year with friends!
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
