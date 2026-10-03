import React, { useState } from 'react';
import { Globe, MapPin, Compass, Search } from 'lucide-react';

export default function CountryHeatmap({ countries }) {
  const [filterQuery, setFilterQuery] = useState('');

  if (!countries) return null;

  const filteredList = countries.allCountries.filter(c => 
    c.country.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>World Cinema & Country Footprint</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            You have watched films originating from{' '}
            <span className="text-emerald-400 font-bold">{countries.totalCount} sovereign nations</span>
          </p>
        </div>

        {/* Search Countries */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter countries..."
            className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-32"
          />
        </div>
      </div>

      {/* Top Countries Bars */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Top Countries by Volume
        </h4>

        <div className="space-y-2.5">
          {countries.topCountries.slice(0, 8).map((c, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-[10px]">#{idx + 1}</span>
                  <span>{c.country}</span>
                </span>
                <span className="text-slate-400 font-medium">
                  <span className="text-cinema-gold font-bold">{c.count}</span> titles ({c.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"
                  style={{ width: `${Math.min(100, Math.max(4, c.percentage * 1.5))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Country Grid / Pills */}
      <div className="pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Complete List of Countries ({filteredList.length})
        </h4>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
          {filteredList.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs transition-colors"
            >
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold text-white">{c.country}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-slate-400 text-[10px] font-bold">
                {c.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
