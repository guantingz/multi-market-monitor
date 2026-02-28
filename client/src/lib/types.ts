// ============================================================
// Multi-Market Live Monitor — Core Type Definitions
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

export type MarketType = 'fx' | 'cn' | 'hk' | 'us' | 'crypto' | 'commodities';

export type Timeframe = '1D' | '4H' | '15m' | '1H' | '5m';

export interface OHLCBar {
  time: number; // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface QuoteSnapshot {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  volume?: number;
  bid?: number;
  ask?: number;
  spread?: number;
  updatedAt: number; // Unix timestamp ms
  isDelayed?: boolean;
  delayMinutes?: number;
  market: MarketType;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  market: MarketType;
}

// ============================================================
// Technical Indicators
// ============================================================

export interface MACDPoint {
  time: number;
  dif: number;
  dea: number;
  histogram: number;
}

export interface RSIPoint {
  time: number;
  value: number;
}

export interface BollingerPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export interface IndicatorData {
  macd: MACDPoint[];
  rsi: RSIPoint[];
  bollinger: BollingerPoint[];
}

// ============================================================
// Chanlun (缠论) Types
// ============================================================

export type FractalType = 'top' | 'bottom';

export interface Fractal {
  index: number;
  time: number;
  price: number;
  type: FractalType;
}

export type BiDirection = 'up' | 'down';

export interface Bi {
  id: number;
  direction: BiDirection;
  startFractal: Fractal;
  endFractal: Fractal;
  kbarCount: number;
}

export interface Zhongshu {
  id: number;
  high: number; // Z.high = min of three bi highs
  low: number;  // Z.low = max of three bi lows
  startTime: number;
  endTime: number;
  biIds: number[];
  isActive: boolean;
}

export type ThirdBuyStatus = 'candidate' | 'confirmed' | 'invalid';

export interface ThirdBuySignal {
  id: string;
  zhongshu: Zhongshu;
  status: ThirdBuyStatus;
  breakoutTime: number;
  breakoutPrice: number;
  pullbackLow?: number;
  pullbackTime?: number;
  confirmTime?: number;
  confirmPrice?: number;
  symbol: string;
  timeframe: Timeframe;
  market: MarketType;
}

// ============================================================
// Signal System
// ============================================================

export type SignalType =
  | 'bollinger_breakout_up'
  | 'bollinger_breakout_down'
  | 'macd_golden_cross'
  | 'macd_death_cross'
  | 'rsi_oversold_reversal'
  | 'rsi_overbought_reversal'
  | 'volatility_surge'
  | 'large_body_candle'
  | 'key_level_breakout'
  | 'multi_timeframe_resonance'
  | 'third_buy_candidate'
  | 'third_buy_confirmed';

export interface Signal {
  id: string;
  symbol: string;
  market: MarketType;
  timeframe: Timeframe;
  type: SignalType;
  strength: number; // 0-100
  price: number;
  time: number; // Unix ms
  description: string;
  keyLevels?: {
    zhongshuHigh?: number;
    zhongshuLow?: number;
    pullbackLow?: number;
    confirmPrice?: number;
  };
  acknowledged?: boolean;
}

export type SignalFilter = 'all' | 'third_buy' | 'indicators';

// ============================================================
// Data Adapter Interface
// ============================================================

export interface MarketDataAdapter {
  name: string;
  market: MarketType;
  isRealtime: boolean;
  delayMinutes?: number;

  getQuote(symbol: string): Promise<QuoteSnapshot>;
  getKlines(symbol: string, timeframe: Timeframe, limit?: number): Promise<OHLCBar[]>;
  subscribeQuote?(symbol: string, callback: (q: QuoteSnapshot) => void): () => void;
}

// ============================================================
// App State
// ============================================================

export interface MarketPageState {
  market: MarketType;
  selectedSymbol: string;
  selectedTimeframe: Timeframe;
  indicators: {
    macd: boolean;
    rsi: boolean;
    bollinger: boolean;
    ma: boolean;
    volume: boolean;
  };
  signals: {
    major: boolean;
    thirdBuyCandidate: boolean;
    thirdBuyConfirmed: boolean;
  };
}

export interface ConnectionStatus {
  status: 'connected' | 'delayed' | 'disconnected';
  lastUpdate: number;
  delayMs?: number;
}
