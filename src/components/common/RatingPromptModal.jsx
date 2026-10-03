import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Star, Heart, Users, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function RatingPromptModal({ movie, isOpen, onClose }) {
  const { handleUpdateMovie } = useApp();
  const [rating, setRating] = useState(8);
  const [hoverRating, setHoverRating] = useState(0);
  const [watchedWith, setWatchedWith] = useState(['wife']);
  const [note, setNote] = useState('');

  if (!isOpen || !movie) return null;

  const handleSubmit = async () => {
    if (rating === 10) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }

    await handleUpdateMovie(movie.imdb_id, {
      is_watched: true,
      is_watchlist: false,
      your_rating: rating,
      date_rated: new Date().toISOString().split('T')[0],
      watched_with: watchedWith,
      user_review: note.trim() || movie.user_review
    });

    onClose();
  };

  const togglePerson = (id) => {
    setWatchedWith(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md rounded-3xl glass-panel border border-cinema-gold/30 shadow-2xl z-10 p-6 space-y-5 bg-gradient-to-b from-cinema-900 to-cinema-950"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-cinema-gold tracking-wider">
              Mark as Watched
            </span>
            <h3 className="text-xl font-extrabold text-white truncate">
              {movie.title}
            </h3>
            <p className="text-xs text-slate-400">
              Set your rating and log who you watched it with.
            </p>
          </div>

          {/* 10-Star Rating Selector */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase">Your Rating</div>
            <div className="text-3xl font-black text-cinema-gold">★ {hoverRating || rating} / 10</div>

            <div className="flex items-center justify-center gap-1.5 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="p-0.5 focus:outline-none transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      (hoverRating || rating) >= s
                        ? 'fill-cinema-gold text-cinema-gold'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Watched With Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Watched With
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'wife', label: 'Wife', icon: Heart, color: 'text-rose-400' },
                { id: 'family', label: 'Family', icon: Users, color: 'text-cyan-400' },
                { id: 'friends', label: 'Friends' },
                { id: 'alone', label: 'Alone' },
              ].map(opt => {
                const isSelected = watchedWith.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => togglePerson(opt.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      isSelected
                        ? 'bg-white/20 text-white border-white/30 shadow'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {opt.icon && <opt.icon className={`w-3.5 h-3.5 ${opt.color || ''}`} />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Short Note */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Quick Thoughts (Optional)
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Loved the plot twist, great ending!"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cinema-gold/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cinema-gold to-cinema-rose text-cinema-950 font-black text-xs shadow-glow-gold hover:opacity-95"
            >
              Save & Log
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
