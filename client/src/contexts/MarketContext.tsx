// ============================================================
// Multi-Market Live Monitor — Market Context
// Global state for market data, signals, and settings
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Signal, SignalFilter, MarketType, Timeframe } from '@/lib/types';
import { globalSignalStore } from '@/lib/signalEngine';
import { MA_CONFIGS } from '@/lib/indicators';

interface SignalSettings {
  major: boolean;
  thirdBuyCandidate: boolean;
  thirdBuyConfirmed: boolean;
  mutedTypes: Set<string>;
}

// Per-MA period toggle map: { 5: false, 10: false, 20: true, ... }
type MAToggles = Record<number, boolean>;

const DEFAULT_MA_TOGGLES: MAToggles = Object.fromEntries(
  MA_CONFIGS.map(cfg => [cfg.period, false])
);

interface MarketContextValue {
  // Current market page
  currentMarket: MarketType;
  setCurrentMarket: (m: MarketType) => void;

  // Per-market selected symbol
  selectedSymbols: Record<MarketType, string>;
  setSelectedSymbol: (market: MarketType, symbol: string) => void;

  // Per-market selected timeframe
  selectedTimeframes: Record<MarketType, Timeframe>;
  setSelectedTimeframe: (market: MarketType, tf: Timeframe) => void;

  // Indicator toggles
  indicators: {
    macd: boolean;
    rsi: boolean;
    bollinger: boolean;
    ma: boolean;
    volume: boolean;
    maToggles: MAToggles;
  };
  toggleIndicator: (key: string) => void;
  toggleMA: (period: number) => void;
  toggleAllMA: (visible: boolean) => void;

  // Signal settings
  signalSettings: SignalSettings;
  toggleSignalType: (key: string) => void;
  muteSignalType: (type: string) => void;
  unmuteSignalType: (type: string) => void;

  // Signals
  signals: Signal[];
  signalFilter: SignalFilter;
  setSignalFilter: (f: SignalFilter) => void;
  addSignals: (signals: Signal[]) => void;

  // Toast notifications
  toastSignals: Signal[];
  dismissToast: (id: string) => void;
}

const defaultSymbols: Record<MarketType, string> = {
  fx: 'EURUSD',
  cn: '1A0001',
  hk: 'HSI',
  us: 'SPY',
  crypto: 'BTCUSDT',
  commodities: 'XAUUSD',
};

const defaultTimeframes: Record<MarketType, Timeframe> = {
  fx: '4H',
  cn: '1D',
  hk: '1D',
  us: '4H',
  crypto: '4H',
  commodities: '1D',
};

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [currentMarket, setCurrentMarket] = useState<MarketType>('fx');
  const [selectedSymbols, setSelectedSymbols] = useState(defaultSymbols);
  const [selectedTimeframes, setSelectedTimeframes] = useState(defaultTimeframes);
  const [indicators, setIndicators] = useState({
    macd: true,
    rsi: true,
    bollinger: true,
    ma: false,
    volume: false,
    maToggles: { ...DEFAULT_MA_TOGGLES },
  });
  const [signalSettings, setSignalSettings] = useState<SignalSettings>({
    major: true,
    thirdBuyCandidate: false,
    thirdBuyConfirmed: true,
    mutedTypes: new Set(),
  });
  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all');
  const [toastSignals, setToastSignals] = useState<Signal[]>([]);
  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const setSelectedSymbol = useCallback((market: MarketType, symbol: string) => {
    setSelectedSymbols(prev => ({ ...prev, [market]: symbol }));
  }, []);

  const setSelectedTimeframe = useCallback((market: MarketType, tf: Timeframe) => {
    setSelectedTimeframes(prev => ({ ...prev, [market]: tf }));
  }, []);

  const toggleIndicator = useCallback((key: string) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  }, []);

  // Toggle a single MA period
  const toggleMA = useCallback((period: number) => {
    setIndicators(prev => {
      const newToggles = { ...prev.maToggles, [period]: !prev.maToggles[period] };
      const anyOn = Object.values(newToggles).some(Boolean);
      return { ...prev, maToggles: newToggles, ma: anyOn };
    });
  }, []);

  // Toggle all MAs at once
  const toggleAllMA = useCallback((visible: boolean) => {
    setIndicators(prev => {
      const newToggles = Object.fromEntries(MA_CONFIGS.map(cfg => [cfg.period, visible]));
      return { ...prev, maToggles: newToggles, ma: visible };
    });
  }, []);

  const toggleSignalType = useCallback((key: string) => {
    setSignalSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  }, []);

  const muteSignalType = useCallback((type: string) => {
    setSignalSettings(prev => ({
      ...prev,
      mutedTypes: new Set(Array.from(prev.mutedTypes).concat(type)),
    }));
  }, []);

  const unmuteSignalType = useCallback((type: string) => {
    setSignalSettings(prev => {
      const next = new Set(prev.mutedTypes);
      next.delete(type);
      return { ...prev, mutedTypes: next };
    });
  }, []);

  const addSignals = useCallback((newSignals: Signal[]) => {
    globalSignalStore.addSignals(newSignals);
    setSignals(globalSignalStore.getSignals());

    const toastWorthy = newSignals.filter(s => s.strength >= 50);
    if (toastWorthy.length > 0) {
      setToastSignals(prev => [...toastWorthy, ...prev].slice(0, 5));
      toastWorthy.forEach(s => {
        const timer = setTimeout(() => {
          setToastSignals(prev => prev.filter(t => t.id !== s.id));
          toastTimers.current.delete(s.id);
        }, 8000);
        toastTimers.current.set(s.id, timer);
      });
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToastSignals(prev => prev.filter(s => s.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  return (
    <MarketContext.Provider value={{
      currentMarket, setCurrentMarket,
      selectedSymbols, setSelectedSymbol,
      selectedTimeframes, setSelectedTimeframe,
      indicators, toggleIndicator, toggleMA, toggleAllMA,
      signalSettings, toggleSignalType, muteSignalType, unmuteSignalType,
      signals, signalFilter, setSignalFilter, addSignals,
      toastSignals, dismissToast,
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarketContext(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarketContext must be used inside MarketProvider');
  return ctx;
}
