import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase, updateMovieRecord, addMovieRecord } from '../db/db';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentView, setCurrentView] = useState('library'); // library, dashboard, wife, family, suggestions, settings
  const [activeTitle, setActiveTitle] = useState(null);
  const [activeBackdrop, setActiveBackdrop] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('cinetrack_theme') !== 'light';
  });
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, watched, watchlist, movies, series, anime, list_cant_miss, list_romcom, etc.
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating_desc'); // rating_desc, imdb_desc, year_desc, title_asc, date_rated_desc
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Initialize Dexie on mount
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await initializeDatabase();
      setIsLoading(false);
    }
    init();
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('cinetrack_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('cinetrack_theme', 'light');
    }
  }, [darkMode]);

  // Reactive query of all titles from IndexedDB
  const allMovies = useLiveQuery(() => db.movies.toArray(), [], []);

  // Quick stats computed reactively
  const stats = useMemo(() => {
    if (!allMovies) return { total: 0, watched: 0, watchlist: 0, movies: 0, series: 0, anime: 0 };
    return {
      total: allMovies.length,
      watched: allMovies.filter(m => m.is_watched).length,
      watchlist: allMovies.filter(m => m.is_watchlist).length,
      movies: allMovies.filter(m => m.is_movie).length,
      series: allMovies.filter(m => m.is_series).length,
      anime: allMovies.filter(m => m.is_anime).length,
    };
  }, [allMovies]);

  // Filtered & Sorted Movie List
  const filteredMovies = useMemo(() => {
    if (!allMovies) return [];

    return allMovies.filter(movie => {
      // 1. Text Search (matches title, original title, director, cast)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = movie.title?.toLowerCase().includes(q) || movie.original_title?.toLowerCase().includes(q);
        const directorMatch = (movie.imdb_directors || []).some(d => d.toLowerCase().includes(q));
        const genreMatch = (movie.genres || movie.imdb_genres || []).some(g => g.toLowerCase().includes(q));
        if (!titleMatch && !directorMatch && !genreMatch) return false;
      }

      // 2. Tab Filter
      if (activeFilter === 'watched' && !movie.is_watched) return false;
      if (activeFilter === 'watchlist' && !movie.is_watchlist) return false;
      if (activeFilter === 'movies' && !movie.is_movie) return false;
      if (activeFilter === 'series' && !movie.is_series) return false;
      if (activeFilter === 'anime' && !movie.is_anime) return false;
      if (activeFilter === 'list_cant_miss' && !movie.lists?.includes("Movies You Can't Miss")) return false;
      if (activeFilter === 'list_romcom' && !movie.lists?.includes("Best 100 Romantic Comedy Movies")) return false;
      if (activeFilter === 'list_tv' && !movie.lists?.includes("Best Tv Series I Watched So Far")) return false;
      if (activeFilter === 'list_animated' && !movie.lists?.includes("Romantic Animated Movies")) return false;
      if (activeFilter === 'list_anime' && !movie.lists?.includes("Anime Series List")) return false;

      // 3. Genre Filter
      if (selectedGenre) {
        const gList = movie.genres?.length ? movie.genres : (movie.imdb_genres || []);
        if (!gList.includes(selectedGenre)) return false;
      }

      // 4. Decade Filter
      if (selectedDecade) {
        const y = movie.year || movie.imdb_year;
        if (!y) return false;
        const dec = parseInt(selectedDecade, 10);
        if (y < dec || y > dec + 9) return false;
      }

      // 5. Min Rating Filter
      if (minRating > 0) {
        const r = movie.your_rating || 0;
        if (r < minRating) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      if (sortBy === 'rating_desc') {
        const rA = a.your_rating ?? -1;
        const rB = b.your_rating ?? -1;
        if (rB !== rA) return rB - rA;
        return (b.imdb_rating ?? 0) - (a.imdb_rating ?? 0);
      }
      if (sortBy === 'imdb_desc') {
        return (b.imdb_rating ?? 0) - (a.imdb_rating ?? 0);
      }
      if (sortBy === 'year_desc') {
        return (b.year || b.imdb_year || 0) - (a.year || a.imdb_year || 0);
      }
      if (sortBy === 'year_asc') {
        return (a.year || a.imdb_year || 9999) - (b.year || b.imdb_year || 9999);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'date_rated_desc') {
        return (b.date_rated || '').localeCompare(a.date_rated || '');
      }
      return 0;
    });
  }, [allMovies, searchQuery, activeFilter, selectedGenre, selectedDecade, minRating, sortBy]);

  // Show a fleeting toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handler to update a movie in state & DB
  const handleUpdateMovie = async (imdbId, updates) => {
    const updated = await updateMovieRecord(imdbId, updates);
    if (activeTitle && activeTitle.imdb_id === imdbId) {
      setActiveTitle(updated);
    }
    showToast(`Updated "${updated.title}"`);
    return updated;
  };

  const value = {
    allMovies,
    filteredMovies,
    stats,
    isLoading,
    currentView,
    setCurrentView,
    activeTitle,
    setActiveTitle,
    activeBackdrop,
    setActiveBackdrop,
    isSearchOpen,
    setIsSearchOpen,
    darkMode,
    setDarkMode,
    toastMessage,
    showToast,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    selectedGenre,
    setSelectedGenre,
    selectedDecade,
    setSelectedDecade,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    handleUpdateMovie,
    addMovieRecord,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
