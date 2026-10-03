import React from 'react';
import { 
  Film, 
  BarChart3, 
  Heart, 
  Users, 
  Sparkles, 
  Settings, 
  PlusCircle, 
  Bookmark,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { currentView, setCurrentView, stats, darkMode, setDarkMode, setIsSearchOpen } = useApp();

  const navItems = [
    { id: 'library', label: 'My Library', icon: Film, badge: stats.total },
    { id: 'dashboard', label: 'Stats & Insights', icon: BarChart3 },
    { id: 'wife', label: 'Watch with Wife', icon: Heart, color: 'text-cinema-rose' },
    { id: 'family', label: 'Watch with Family', icon: Users, color: 'text-cinema-cyan' },
    { id: 'suggestions', label: 'Suggestions & Mood', icon: Sparkles, color: 'text-cinema-gold' },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/10 dark:border-white/10 bg-cinema-900/60 backdrop-blur-xl h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cinema-gold to-cinema-rose flex items-center justify-center shadow-glow-gold">
          <Film className="w-6 h-6 text-cinema-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400 bg-clip-text text-transparent">
            CineTrack
          </h1>
          <p className="text-xs text-slate-400 font-medium">Personal Movie Hub</p>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 py-4">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cinema-gold via-amber-500 to-cinema-rose text-cinema-950 font-bold text-sm shadow-glow-gold hover:opacity-95 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Add Movie / Search</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm border border-white/15 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.color || (isActive ? 'text-cinema-gold' : 'text-slate-400')}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white/10 text-slate-300">
                  {item.badge.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Quick Stats Card */}
      <div className="p-4 mx-3 mb-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Overview</span>
          <span className="text-cinema-gold font-bold">{stats.watched} Watched</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-xl bg-black/20">
            <div className="text-base font-bold text-white">{stats.movies}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Movies</div>
          </div>
          <div className="p-2 rounded-xl bg-black/20">
            <div className="text-base font-bold text-white">{stats.watchlist}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Watchlist</div>
          </div>
        </div>
      </div>

      {/* Footer & Theme Toggle */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cinema-neon animate-pulse" />
          <span>Offline Ready</span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-cinema-gold" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>
      </div>
    </aside>
  );
}
