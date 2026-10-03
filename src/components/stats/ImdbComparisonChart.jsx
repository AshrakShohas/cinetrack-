import React, { useState } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ZAxis,
  Cell 
} from 'recharts';
import { Scale, Star, ThumbsUp, ThumbsDown, Sparkles, Gem } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-2xl bg-cinema-900/95 border border-white/20 backdrop-blur-md shadow-2xl text-xs max-w-xs">
        <div className="font-extrabold text-white text-sm line-clamp-1 mb-1">{data.title}</div>
        <div className="flex items-center justify-between text-slate-300 gap-4 mb-1">
          <span>Your Rating:</span>
          <span className="text-cinema-gold font-black">★ {data.your_rating}</span>
        </div>
        <div className="flex items-center justify-between text-slate-300 gap-4 mb-1">
          <span>IMDb Rating:</span>
          <span className="text-cyan-400 font-black">★ {data.imdb_rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-300 gap-4 pt-1 border-t border-white/10 font-bold">
          <span>Difference:</span>
          <span className={data.delta > 0 ? 'text-emerald-400' : data.delta < 0 ? 'text-rose-400' : 'text-slate-400'}>
            {data.delta > 0 ? `+${data.delta}` : data.delta}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ImdbComparisonChart({ vsImdb }) {
  const { setActiveTitle, allMovies } = useApp();
  const [activeTab, setActiveTab] = useState('guilty'); // 'guilty', 'hidden_gems', 'tough_calls'

  if (!vsImdb) return null;

  const currentHighlightList = 
    activeTab === 'guilty' ? vsImdb.guiltyPleasures :
    activeTab === 'hidden_gems' ? vsImdb.hiddenGems : vsImdb.toughCalls;

  const handleTitleClick = (titleName) => {
    const found = allMovies?.find(m => m.title === titleName);
    if (found) setActiveTitle(found);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Banner & Critic Style */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cinema-gold text-xs font-black uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Critic Profiler</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Your Rating vs. IMDb Rating Consensus
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {vsImdb.criticStyle}
          </p>
        </div>

        {/* Delta Stat Pill */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 self-start md:self-auto">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Average Delta</div>
            <div className={`text-2xl font-black ${Number(vsImdb.avgDelta) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {Number(vsImdb.avgDelta) > 0 ? `+${vsImdb.avgDelta}` : vsImdb.avgDelta}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-[11px] text-slate-300">
            <div><span className="text-emerald-400 font-bold">{vsImdb.higherCount}</span> Higher than IMDb</div>
            <div><span className="text-rose-400 font-bold">{vsImdb.lowerCount}</span> Stricter than IMDb</div>
          </div>
        </div>
      </div>

      {/* 2. Scatter Plot Chart */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Rating Scatter Matrix (IMDb Rating vs. Your Rating)
          </h4>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Points above diagonal = You liked it more than IMDb
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
              <XAxis 
                type="number" 
                dataKey="imdb_rating" 
                name="IMDb Rating" 
                domain={[4, 10]} 
                unit=""
                stroke="#64748B" 
                fontSize={11}
                tickLine={false}
                label={{ value: 'IMDb Rating', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 10 }}
              />
              <YAxis 
                type="number" 
                dataKey="your_rating" 
                name="Your Rating" 
                domain={[3, 10]} 
                unit=""
                stroke="#64748B" 
                fontSize={11}
                tickLine={false}
                label={{ value: 'Your Rating', angle: -90, position: 'insideLeft', offset: 25, fill: '#64748B', fontSize: 10 }}
              />
              <ZAxis range={[35, 35]} />
              <Tooltip content={<CustomScatterTooltip />} />
              <Scatter data={vsImdb.scatterData}>
                {vsImdb.scatterData.map((entry, index) => {
                  const color = entry.delta > 1.2 ? '#10B981' : entry.delta < -1.2 ? '#F43F5E' : '#F59E0B';
                  return <Cell key={`scatter-${index}`} fill={color} fillOpacity={0.65} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Deep Dive Lists: Guilty Pleasures, Hidden Gems, Tough Calls */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cinema-gold" />
            <span>Notable Divergences & Gems</span>
          </h4>

          {/* Tab Selector */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('guilty')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'guilty'
                  ? 'bg-rose-500 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Guilty Pleasures ({vsImdb.guiltyPleasures.length})
            </button>
            <button
              onClick={() => setActiveTab('hidden_gems')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'hidden_gems'
                  ? 'bg-amber-500 text-cinema-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hidden Gems ({vsImdb.hiddenGems.length})
            </button>
            <button
              onClick={() => setActiveTab('tough_calls')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'tough_calls'
                  ? 'bg-cyan-500 text-cinema-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tough Calls ({vsImdb.toughCalls.length})
            </button>
          </div>
        </div>

        {/* Selected Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentHighlightList.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleTitleClick(item.title)}
              className="cursor-pointer group p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <h5 className="text-sm font-bold text-white group-hover:text-cinema-gold transition-colors line-clamp-1">
                  {item.title}
                </h5>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {item.year || '—'}
                  {item.votes ? ` &bull; ${item.votes.toLocaleString()} votes` : ''}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs font-semibold">
                <div className="flex items-center gap-1 text-cinema-gold font-black">
                  <Star className="w-3.5 h-3.5 fill-cinema-gold" />
                  <span>★ {item.your_rating}</span>
                </div>
                <div className="text-slate-400">
                  IMDb: <span className="text-slate-200 font-bold">{item.imdb_rating.toFixed(1)}</span>
                </div>
                <div className={`font-black ${item.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.delta > 0 ? `+${item.delta}` : item.delta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
