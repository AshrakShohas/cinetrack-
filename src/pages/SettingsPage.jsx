import React, { useState } from 'react';
import { Settings, Download, RotateCcw, Shield, Database, Check, Upload, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportDatabaseJSON, resetDatabase } from '../db/db';

export default function SettingsPage() {
  const { stats, showToast } = useApp();
  const [isResetting, setIsResetting] = useState(false);

  const handleExportJSON = async () => {
    try {
      const jsonStr = await exportDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cinetrack_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Database exported successfully!');
    } catch (e) {
      console.error(e);
      showToast('Failed to export database.');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all ratings and notes back to the original IMDb import?')) {
      setIsResetting(true);
      await resetDatabase();
      setIsResetting(false);
      showToast('Database reset to original import!');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      <div className="p-6 rounded-3xl glass-panel border border-white/10">
        <div className="flex items-center gap-2 text-cinema-gold text-xs font-black uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Configuration & Privacy</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Settings & Data Hub</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Manage your IndexedDB local database, export backups, re-import fresh IMDb files, and manage privacy.
        </p>
      </div>

      {/* Database Status Card */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Local IndexedDB Storage (Offline First)</span>
        </h3>
        <p className="text-xs text-slate-300">
          Your personal library is fully stored on your device inside browser IndexedDB. All changes, ratings, tags, and reviews persist offline.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-lg font-bold text-white">{stats.total.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Stored</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-lg font-bold text-cinema-gold">{stats.watched.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Watched</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-lg font-bold text-cyan-400">{stats.watchlist.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Watchlist</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-lg font-bold text-emerald-400">Offline</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Storage State</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isResetting ? 'Resetting...' : 'Reset to Default Import'}</span>
          </button>
        </div>
      </div>

      {/* Netlify & Privacy Section */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Site Privacy & Netlify Protection</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          If you deploy this site on Netlify and do not want your personal ratings to be public to the internet, you can easily protect it via either:
        </p>
        <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside bg-black/20 p-4 rounded-2xl border border-white/5">
          <li><strong>Netlify Password Protection</strong>: On your Netlify Site dashboard, go to <em>Site Configuration &rarr; Access control &rarr; Password protection</em> and set a site password.</li>
          <li><strong>App Code Gate</strong>: Set <code>APP_ACCESS_CODE=your_secret</code> in your <code>.env</code> file.</li>
        </ul>
      </div>

      {/* Re-import Guide */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-cinema-gold" />
          <span>Re-Importing Newer IMDb Exports</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          When you download fresh exports from IMDb in the future, simply drop them into this project folder and run:
        </p>
        <pre className="p-3 rounded-xl bg-black/40 text-cinema-gold font-mono text-xs overflow-x-auto">
          python pipeline/parse_imdb.py
        </pre>
        <p className="text-xs text-slate-400">
          The pipeline merges any newly added titles without creating duplicates.
        </p>
      </div>
    </div>
  );
}
