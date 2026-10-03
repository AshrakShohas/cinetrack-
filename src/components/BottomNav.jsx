import React from 'react';
import { Film, BarChart3, Heart, Users, Sparkles, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { currentView, setCurrentView, setIsSearchOpen } = useApp();

  const items = [
    { id: 'library', label: 'Library', icon: Film },
    { id: 'wife', label: 'Wife', icon: Heart, color: 'text-cinema-rose' },
    { id: 'search_action', label: 'Add', icon: Plus, isAction: true },
    { id: 'family', label: 'Family', icon: Users, color: 'text-cinema-cyan' },
    { id: 'dashboard', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cinema-900/90 backdrop-blur-xl border-t border-white/10 px-3 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {items.map(item => {
          const Icon = item.icon;
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => setIsSearchOpen(true)}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cinema-gold to-cinema-rose flex items-center justify-center shadow-lg shadow-amber-500/30 text-cinema-950 font-bold active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[10px] text-slate-300 font-semibold mt-0.5">{item.label}</span>
              </button>
            );
          }

          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-1 px-2 transition-colors ${
                isActive ? 'text-cinema-gold font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-cinema-gold' : item.color || ''}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
