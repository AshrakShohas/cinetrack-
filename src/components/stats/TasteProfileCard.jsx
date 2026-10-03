import React from 'react';
import { Sparkles, Compass, Heart, Film } from 'lucide-react';

export default function TasteProfileCard({ tasteProfile, overview }) {
  if (!tasteProfile) return null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cinema-gold/30 bg-gradient-to-br from-amber-950/30 via-cinema-900 to-cinema-950 relative overflow-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cinema-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-cinema-gold/20 border border-cinema-gold/30 text-cinema-gold text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Taste Persona</span>
          </div>
          <span className="text-xs text-slate-400">&bull; Generated from your 2,109 ratings</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          The Narrative Purist & Emotional Cinephile
        </h3>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl font-medium">
          {tasteProfile.narrative}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Signature Trait</div>
            <div className="text-xs font-bold text-cinema-gold mt-0.5">High Emotional Empathy</div>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Preferred Pacing</div>
            <div className="text-xs font-bold text-cyan-400 mt-0.5">Character-Driven</div>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Masterpieces Rated 10</div>
            <div className="text-xs font-bold text-rose-400 mt-0.5">{overview.perfect10Count} Masterpieces</div>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Consensus Stance</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">Warm & Discerning</div>
          </div>
        </div>
      </div>
    </div>
  );
}
