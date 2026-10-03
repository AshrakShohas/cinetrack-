import React, { useState, useMemo } from 'react';
import { Sparkles, Trophy, BarChart3, Film, Clock, Heart, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeComprehensiveStats } from '../services/statsEngine';

// Stats Subcomponents
import HeroMetricCards from '../components/stats/HeroMetricCards';
import TasteProfileCard from '../components/stats/TasteProfileCard';
import RatingDistributionChart from '../components/stats/RatingDistributionChart';
import GenresDecadesChart from '../components/stats/GenresDecadesChart';
import PeopleRankings from '../components/stats/PeopleRankings';
import CountryHeatmap from '../components/stats/CountryHeatmap';
import ImdbComparisonChart from '../components/stats/ImdbComparisonChart';
import FunMilestones from '../components/stats/FunMilestones';
import YearInReviewModal from '../components/stats/YearInReviewModal';

export default function DashboardPage() {
  const { allMovies } = useApp();
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);

  // Compute all analytics reactively from IndexedDB records
  const stats = useMemo(() => {
    return computeComprehensiveStats(allMovies || []);
  }, [allMovies]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-cinema-gold/30 border-t-cinema-gold animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Computing analytics across your titles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Top Banner with Year in Review Launcher */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-cinema-900/90 via-cinema-950 to-cinema-900">
        <div>
          <div className="flex items-center gap-2 text-cinema-gold text-xs font-black uppercase tracking-wider mb-1.5">
            <Trophy className="w-4 h-4" />
            <span>Lifetime Movie Tracker & Insights</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cinema Analytics Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Derived directly from your {stats.overview.totalWatched.toLocaleString()} watched titles, {stats.ratings.totalRated.toLocaleString()} ratings, and 9 years of viewing history.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto flex-shrink-0">
          <button
            onClick={() => {
              import('../services/reportGenerator').then(mod => {
                mod.downloadMarkdownReport(stats);
              });
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/10 transition-all active:scale-95"
            title="Download complete report as Markdown"
          >
            <Share2 className="w-4 h-4 text-cinema-cyan" />
            <span>Download Report</span>
          </button>

          <button
            onClick={() => setIsWrappedOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cinema-gold via-rose-500 to-cyan-500 text-cinema-950 font-black text-xs sm:text-sm shadow-glow-gold hover:opacity-95 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Year in Review (Wrapped)</span>
          </button>
        </div>
      </div>

      {/* 1. Hero KPI Cards */}
      <HeroMetricCards stats={stats} />

      {/* 2. Automated Taste Persona & Narrative */}
      <TasteProfileCard tasteProfile={stats.tasteProfile} overview={stats.overview} />

      {/* 3. Ratings Distribution */}
      <RatingDistributionChart ratings={stats.ratings} />

      {/* 4. Genres and Decades Analysis */}
      <GenresDecadesChart genres={stats.genres} decades={stats.decades} />

      {/* 5. Creative Talents (Directors, Actors & Actresses Separated) */}
      <PeopleRankings 
        directors={stats.directors} 
        actors={stats.actors} 
        actresses={stats.actresses} 
      />

      {/* 6. World Cinema Footprint & Country Heatmap */}
      <CountryHeatmap countries={stats.countries} />

      {/* 7. IMDb vs. Your Rating Comparison & Matrix */}
      <ImdbComparisonChart vsImdb={stats.vsImdb} />

      {/* 8. Personal Milestones & Fun Records */}
      <FunMilestones funStats={stats.funStats} />

      {/* Year in Review Modal */}
      <YearInReviewModal 
        isOpen={isWrappedOpen} 
        onClose={() => setIsWrappedOpen(false)} 
      />
    </div>
  );
}
