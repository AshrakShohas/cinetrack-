import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getBackdropUrl } from '../services/tmdb';

export default function AmbientBackdrop() {
  const { activeBackdrop, activeTitle, allMovies } = useApp();

  // Pick ambient backdrop: from activeTitle, activeBackdrop, or randomly from 10/10 favorites
  const currentBackdropUrl = useMemo(() => {
    if (activeBackdrop) return activeBackdrop;
    if (activeTitle?.backdrop_path) return getBackdropUrl(activeTitle.backdrop_path);
    if (activeTitle?.poster_path) return getBackdropUrl(activeTitle.poster_path);

    // Fallback: pick a high-rated movie from user library
    if (allMovies && allMovies.length > 0) {
      const topRatedWithBackdrop = allMovies.find(m => m.your_rating === 10 && m.backdrop_path);
      if (topRatedWithBackdrop) {
        return getBackdropUrl(topRatedWithBackdrop.backdrop_path);
      }
    }
    return null;
  }, [activeBackdrop, activeTitle, allMovies]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <AnimatePresence mode="wait">
        {currentBackdropUrl ? (
          <motion.div
            key={currentBackdropUrl}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-110"
            style={{ backgroundImage: `url(${currentBackdropUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cinema-950 via-cinema-900 to-cinema-950" />
        )}
      </AnimatePresence>

      {/* Cinematic Vignette & Readability Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/80 to-cinema-950/60 dark:from-cinema-950 dark:via-cinema-950/85 dark:to-cinema-950/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cinema-cyan/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
