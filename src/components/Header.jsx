import React from 'react';
import { Search, Film, Sparkles, Filter, SlidersHorizontal, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { 
    currentView, 
    stats, 
    setIsSearchOpen, 
    searchQuery, 
    setSearchQuery,
    darkMode,
    setDarkMode
  } = useApp();

  const viewTitles = {
    library: 'Movie Library',
    dashboard: 'Insights & Statistics',
    wife: 'Watch with Wife',
    family: 'Watch with Family',
    suggestions: 'Curated Suggestions',
    settings: 'Settings & Data Management',
  };

  return (
    <header className="sticky top-0 z-20 bg-cinema-950/70 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* View Title or Brand on Mobile */}
      <div className="flex items-center gap-3">
        <div className="md:hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-cinema-gold to-cinema-rose flex items-center justify-center">
          <Film className="w-5 h-5 text-cinema-950 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
            {viewTitles[currentView] || 'CineTrack'}
          </h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            {stats.watched.toLocaleString()} watched &bull; {stats.watchlist.toLocaleString()} in watchlist
          </p>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="cursor-pointer group flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cinema-gold/30 transition-all text-slate-400 hover:text-slate-200"
        >
          <Search className="w-4 h-4 text-cinema-gold group-hover:scale-110 transition-transform" />
          <span className="text-xs md:text-sm font-medium flex-1 truncate">
            {searchQuery ? `Searching: "${searchQuery}"` : 'Search 2,914 titles, actors, directors...'}
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/10 rounded">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-cinema-gold" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>
      </div>
    </header>
  );
}
