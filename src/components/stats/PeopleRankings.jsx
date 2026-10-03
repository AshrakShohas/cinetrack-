import React, { useState } from 'react';
import { Award, User, Star, Film, Sparkles } from 'lucide-react';
import { getPosterUrl } from '../../services/tmdb';

export default function PeopleRankings({ directors = [], actors = [], actresses = [] }) {
  const [activeTab, setActiveTab] = useState('directors'); // 'directors', 'actors', 'actresses'

  const currentList = 
    activeTab === 'directors' ? directors :
    activeTab === 'actors' ? actors : actresses;

  return (
    <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-cinema-gold" />
            <span>Creative Talents & Icons</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Your most-watched and highest-rated directors, actors, and actresses
          </p>
        </div>

        {/* Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('directors')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'directors'
                ? 'bg-gradient-to-r from-cinema-gold to-amber-500 text-cinema-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Directors ({directors.length})
          </button>
          <button
            onClick={() => setActiveTab('actors')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'actors'
                ? 'bg-gradient-to-r from-cinema-cyan to-blue-500 text-cinema-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Actors ({actors.length})
          </button>
          <button
            onClick={() => setActiveTab('actresses')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'actresses'
                ? 'bg-gradient-to-r from-cinema-rose to-pink-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Actresses ({actresses.length})
          </button>
        </div>
      </div>

      {/* Grid of Ranked Talents */}
      {currentList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {currentList.map((person, idx) => (
            <div
              key={idx}
              className="group p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Badge */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                  idx === 0 ? 'bg-amber-400 text-cinema-950 shadow-glow-gold' :
                  idx === 1 ? 'bg-slate-300 text-cinema-950' :
                  idx === 2 ? 'bg-amber-700 text-white' :
                  'bg-white/10 text-slate-400'
                }`}>
                  #{idx + 1}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white group-hover:text-cinema-gold transition-colors truncate">
                    {person.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {person.count} {person.count === 1 ? 'title' : 'titles'} watched
                    {person.sampleTitles && (
                      <span className="text-slate-500 ml-1">({person.sampleTitles})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Average Rating Badge */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-cinema-gold text-xs font-black flex-shrink-0">
                <Star className="w-3.5 h-3.5 fill-cinema-gold" />
                <span>{person.avgRating}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400 text-xs">
          Live TMDB enrichment will populate individual cast profiles into this section.
        </div>
      )}
    </div>
  );
}
