import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  X, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Star, 
  Users, 
  Film, 
  Trophy,
  ArrowRight
} from 'lucide-react';
import { getPosterUrl } from '../../services/tmdb';

export default function SwipeMatchModal({ isOpen, onClose, candidateMovies = [], onSelectWinner }) {
  const [currentUser, setCurrentUser] = useState('Ashrak'); // 'Ashrak' or 'Wife'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState({
    Ashrak: new Set(),
    Wife: new Set()
  });
  const [matches, setMatches] = useState([]);
  const [justMatchedMovie, setJustMatchedMovie] = useState(null);

  if (!isOpen) return null;

  const currentMovie = candidateMovies[currentIndex];
  const isFinished = currentIndex >= candidateMovies.length;

  const handleVote = (liked) => {
    if (!currentMovie) return;

    const nextVotes = {
      ...votes,
      [currentUser]: new Set(votes[currentUser])
    };

    if (liked) {
      nextVotes[currentUser].add(currentMovie.imdb_id);

      // Check if other user already voted YES
      const otherUser = currentUser === 'Ashrak' ? 'Wife' : 'Ashrak';
      if (nextVotes[otherUser].has(currentMovie.imdb_id)) {
        // It's a match!
        setMatches(prev => [...prev, currentMovie]);
        setJustMatchedMovie(currentMovie);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#F43F5E', '#F59E0B', '#06B6D4', '#EC4899']
        });
      }
    }

    setVotes(nextVotes);
    setCurrentIndex(prev => prev + 1);
  };

  const switchUser = () => {
    setCurrentUser(prev => prev === 'Ashrak' ? 'Wife' : 'Ashrak');
    setCurrentIndex(0);
    setJustMatchedMovie(null);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setVotes({ Ashrak: new Set(), Wife: new Set() });
    setMatches([]);
    setJustMatchedMovie(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl overflow-hidden glass-panel border border-rose-500/30 shadow-2xl z-10 p-5 sm:p-6 space-y-4 bg-gradient-to-b from-cinema-900 via-cinema-950 to-black text-center"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
                <Heart className="w-4 h-4 fill-rose-400" />
              </span>
              <span className="text-xs font-black uppercase text-white tracking-wider">
                Couples Match Game
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white/10 text-rose-300">
                {matches.length} Matches
              </span>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Turn Switcher Banner */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-left pl-2">
              <Users className="w-4 h-4 text-cinema-gold" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Currently Swiping</div>
                <div className="text-sm font-extrabold text-white">
                  {currentUser === 'Ashrak' ? "Ashrak's Turn" : "Wife's Turn"}
                </div>
              </div>
            </div>

            <button
              onClick={switchUser}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cinema-gold text-xs font-bold transition-colors"
            >
              Switch to {currentUser === 'Ashrak' ? 'Wife' : 'Ashrak'} &rarr;
            </button>
          </div>

          {/* Swipe Card Arena */}
          {!isFinished && currentMovie ? (
            <div className="relative aspect-[3/4] w-full max-w-xs mx-auto rounded-3xl overflow-hidden glass-card border border-white/15 shadow-2xl flex flex-col justify-end p-5 text-left group">
              {/* Poster Image */}
              {currentMovie.poster_path ? (
                <img
                  src={getPosterUrl(currentMovie.poster_path, 'w500')}
                  alt={currentMovie.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-900 to-cinema-850 flex items-center justify-center">
                  <Film className="w-16 h-16 text-slate-600" />
                </div>
              )}

              {/* Gradient Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              {/* Card Meta Content */}
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-500 text-white">
                    Romance Pick
                  </span>
                  {currentMovie.imdb_rating && (
                    <span className="text-xs font-black text-cinema-gold">
                      ★ {currentMovie.imdb_rating.toFixed(1)}
                    </span>
                  )}
                  <span className="text-xs text-slate-300 font-medium">
                    {currentMovie.year || currentMovie.imdb_year}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white leading-tight">
                  {currentMovie.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2 pt-0.5">
                  {currentMovie.overview || 'A charming and romantic favorite from your watchlist.'}
                </p>

                <div className="text-[11px] text-slate-400 pt-1">
                  Card {currentIndex + 1} of {candidateMovies.length}
                </div>
              </div>
            </div>
          ) : (
            /* Finished Card */
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <Trophy className="w-12 h-12 text-cinema-gold mx-auto" />
              <h3 className="text-xl font-bold text-white">All Candidates Reviewed!</h3>
              <p className="text-xs text-slate-300">
                You've both found <span className="font-bold text-rose-400">{matches.length} mutual matches</span> for movie night.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Restart Swiping
              </button>
            </div>
          )}

          {/* Vote Buttons (Dislike / Like) */}
          {!isFinished && (
            <div className="flex items-center justify-center gap-6 pt-2">
              {/* Dislike / Pass */}
              <button
                onClick={() => handleVote(false)}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 flex items-center justify-center transition-all active:scale-90 shadow-lg"
                title="Pass"
              >
                <X className="w-7 h-7 stroke-[2.5]" />
              </button>

              {/* Like / Vote YES */}
              <button
                onClick={() => handleVote(true)}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all active:scale-95"
                title="Yes, Want to Watch!"
              >
                <Heart className="w-8 h-8 fill-white stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Immediate Match Popover */}
          {justMatchedMovie && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-rose-600/30 to-pink-600/30 border border-rose-500/40 text-left flex items-center justify-between gap-3 shadow-glow-gold"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 block">
                  🎉 It's a Mutual Match!
                </span>
                <h4 className="text-sm font-extrabold text-white truncate max-w-[200px]">
                  {justMatchedMovie.title}
                </h4>
              </div>
              <button
                onClick={() => {
                  onSelectWinner(justMatchedMovie);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-cinema-gold text-cinema-950 text-xs font-black shadow hover:opacity-95 flex-shrink-0"
              >
                Watch Tonight &rarr;
              </button>
            </motion.div>
          )}

          {/* Matches List Preview */}
          {matches.length > 0 && !justMatchedMovie && (
            <div className="pt-2 border-t border-white/10 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Agreed Matches ({matches.length})
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {matches.map((m, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onSelectWinner(m);
                      onClose();
                    }}
                    className="cursor-pointer flex-shrink-0 w-20 rounded-xl overflow-hidden glass-card border border-white/10 group"
                  >
                    <div className="aspect-[2/3] bg-cinema-900">
                      {m.poster_path && (
                        <img src={getPosterUrl(m.poster_path, 'w92')} alt={m.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-1 text-[10px] text-white font-bold truncate group-hover:text-cinema-gold">
                      {m.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
