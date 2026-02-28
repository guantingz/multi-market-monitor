// ============================================================
// Multi-Market Live Monitor — App Root
// Routes + Global Layout + MarketProvider
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import { MarketProvider, useMarketContext } from './contexts/MarketContext';
import NavSidebar from './components/NavSidebar';
import MarketPage from './components/MarketPage';
import SignalCenter from './pages/SignalCenter';
import SignalToast from './components/SignalToast';
import ErrorBoundary from './components/ErrorBoundary';
import type { MarketType } from './lib/types';
type AppView = 'market' | 'signal_center';

function AppContent() {
  const { currentMarket, setCurrentMarket, signals } = useMarketContext();
  const [view, setView] = useState<AppView>('market');

  const unreadCount = signals.filter(s => !s.acknowledged).length;

  const handleSignalCenter = () => {
    setView(prev => prev === 'signal_center' ? 'market' : 'signal_center');
  };

  const handleSetMarket = (m: MarketType) => {
    setCurrentMarket(m);
    setView('market');
  };

  // make sure to consider if you need authentication for certain routes
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#060b18' }}>
      {/* Left navigation */}
      <NavSidebar
        onSignalCenter={handleSignalCenter}
        onMarketChange={handleSetMarket}
        signalCenterActive={view === 'signal_center'}
        unreadCount={Math.min(unreadCount, 99)}
      />

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {view === 'signal_center' ? (
          <SignalCenter />
        ) : (
          <MarketPage market={currentMarket} />
        )}
      </div>

      {/* Signal toast notifications */}
      <SignalToast />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <MarketProvider>
            <AppContent />
            <Toaster />
          </MarketProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
