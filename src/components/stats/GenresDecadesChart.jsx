import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Film, Calendar, Star, Sparkles } from 'lucide-react';

export default function GenresDecadesChart({ genres, decades }) {
  const [genreSortMode, setGenreSortMode] = useState('count'); // 'count' or 'rating'

  if (!genres || !decades) return null;

  const currentGenreData = genreSortMode === 'count' ? genres.topByCount : genres.topByRating;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. Genres Breakdown */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-cinema-gold" />
              <span>Genre Fingerprint</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {genreSortMode === 'count' ? 'Most frequently watched genres' : 'Highest rated genres (min 10 titles)'}
            </p>
          </div>

          <div className="flex items-center p-0.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              onClick={() => setGenreSortMode('count')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                genreSortMode === 'count' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Count
            </button>
            <button
              onClick={() => setGenreSortMode('rating')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                genreSortMode === 'rating' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Rating
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={currentGenreData}
              margin={{ top: 5, right: 30, left: 45, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                type="category" 
                dataKey="genre" 
                stroke="#CBD5E1" 
                fontSize={11} 
                tickLine={false} 
                width={70}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-cinema-900 border border-white/20 text-xs">
                        <div className="font-bold text-white">{d.genre}</div>
                        <div className="text-slate-400">{d.count} titles watched</div>
                        <div className="text-cinema-gold font-bold">★ {d.avgRating} average rating</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey={genreSortMode === 'count' ? 'count' : 'avgRating'} 
                fill="#06B6D4" 
                radius={[0, 6, 6, 0]}
              >
                {currentGenreData.map((_, index) => (
                  <Cell 
                    key={`genre-cell-${index}`} 
                    fill={genreSortMode === 'count' ? '#06B6D4' : '#F59E0B'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Decades / Era Preferences */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cinema-rose" />
              <span>Decades & Eras Explored</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Volume and average score across release eras
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={decades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="decade" 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-cinema-900 border border-white/20 text-xs">
                        <div className="font-bold text-white">{label}</div>
                        <div className="text-slate-400">{d.count} titles watched</div>
                        <div className="text-cinema-gold font-bold">Avg Rating: ★ {d.avgRating}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#F43F5E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
          <span>Golden Era: <span className="text-white font-bold">{decades[0]?.decade}</span></span>
          <span className="text-cinema-gold font-semibold">High affinity for 2000s & 2010s cinema</span>
        </div>
      </div>
    </div>
  );
}
