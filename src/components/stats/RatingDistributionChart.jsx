import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Star, BarChart3 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-cinema-900/95 border border-white/15 backdrop-blur-md shadow-xl text-xs">
        <div className="flex items-center gap-1 text-cinema-gold font-black mb-1">
          <Star className="w-3.5 h-3.5 fill-cinema-gold" />
          <span>Rating: {label} / 10</span>
        </div>
        <div className="text-white font-bold">{data.count.toLocaleString()} Titles</div>
        <div className="text-slate-400">{data.percentage}% of all your rated titles</div>
      </div>
    );
  }
  return null;
};

export default function RatingDistributionChart({ ratings }) {
  if (!ratings) return null;

  const data = ratings.distribution.map(d => ({
    name: `★ ${d.rating}`,
    count: d.count,
    percentage: d.percentage
  }));

  return (
    <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cinema-gold" />
            <span>Rating Distribution</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            How you score films ({ratings.totalRated.toLocaleString()} total rated)
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-cinema-gold text-xs font-bold">
          <span>Avg: ★ {ratings.averageRating}</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => {
                // Color scale from muted to bright gold for 9 and 10
                const colors = [
                  '#475569', '#475569', '#64748B', '#64748B',
                  '#0284C7', '#0EA5E9', '#38BDF8', '#F59E0B',
                  '#F59E0B', '#E11D48'
                ];
                return <Cell key={`cell-${index}`} fill={colors[index] || '#F59E0B'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-white/10 text-center text-[10px] text-slate-400">
        <div>1-6: <span className="font-bold text-slate-300">{ratings.distribution.slice(0, 6).reduce((a, b) => a + b.count, 0)}</span></div>
        <div>7: <span className="font-bold text-slate-300">{ratings.distribution[6]?.count || 0}</span></div>
        <div>8: <span className="font-bold text-cyan-400">{ratings.distribution[7]?.count || 0}</span></div>
        <div>9: <span className="font-bold text-amber-400">{ratings.distribution[8]?.count || 0}</span></div>
        <div>10: <span className="font-bold text-rose-400">{ratings.distribution[9]?.count || 0}</span></div>
      </div>
    </div>
  );
}
