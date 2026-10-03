import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AmbientBackdrop from './components/AmbientBackdrop';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import MovieDetailModal from './components/MovieDetailModal';
import AddSearchModal from './components/AddSearchModal';

// Pages
import LibraryPage from './pages/LibraryPage';
import DashboardPage from './pages/DashboardPage';
import WatchWithWifePage from './pages/WatchWithWifePage';
import WatchWithFamilyPage from './pages/WatchWithFamilyPage';
import SuggestionsPage from './pages/SuggestionsPage';
import SettingsPage from './pages/SettingsPage';

function MainLayout() {
  const { currentView, toastMessage, isLoading } = useApp();

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Dynamic Ambient Background */}
      <AmbientBackdrop />

      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-cinema-gold/30 border-t-cinema-gold animate-spin" />
              <p className="text-sm font-semibold text-slate-300">
                Loading your 2,914 titles into IndexedDB...
              </p>
            </div>
          ) : (
            <>
              {currentView === 'library' && <LibraryPage />}
              {currentView === 'dashboard' && <DashboardPage />}
              {currentView === 'wife' && <WatchWithWifePage />}
              {currentView === 'family' && <WatchWithFamilyPage />}
              {currentView === 'suggestions' && <SuggestionsPage />}
              {currentView === 'settings' && <SettingsPage />}
            </>
          )}
        </main>

        {/* Mobile Navigation */}
        <BottomNav />
      </div>

      {/* Interactive Detail Modal & Search Flow */}
      <MovieDetailModal />
      <AddSearchModal />

      {/* Fleeting Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-cinema-900/90 text-white font-semibold text-xs border border-white/20 shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cinema-gold" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
