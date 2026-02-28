// ============================================================
// Multi-Market Live Monitor — Signal Engine
// Detects 8+ signal types, scores strength, deduplicates
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import type {
  OHLCBar,
  Signal,
  SignalType,
  Timeframe,
  MarketType,
  MACDPoint,
  RSIPoint,
  BollingerPoint,
} from './types';
import type { ThirdBuySignal } from './types';
import { calcATR } from './indicators';
import { nanoid } from 'nanoid';

// ---- Signal deduplication window (ms) ----
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// ---- Signal history for dedup ----
const signalHistory = new Map<string, number>(); // key -> last trigger time

function dedupKey(symbol: string, timeframe: Timeframe, type: SignalType): string {
  return `${symbol}:${timeframe}:${type}`;
}

function isDuplicate(symbol: string, timeframe: Timeframe, type: SignalType): boolean {
  const key = dedupKey(symbol, timeframe, type);
  const last = signalHistory.get(key);
  if (!last) return false;
  return Date.now() - last < DEDUP_WINDOW_MS;
}

function markTriggered(symbol: string, timeframe: Timeframe, type: SignalType): void {
  signalHistory.set(dedupKey(symbol, timeframe, type), Date.now());
}

// ---- Timeframe weight for scoring ----
const TF_WEIGHT: Record<Timeframe, number> = {
  '1D': 3.0,
  '4H': 2.0,
  '1H': 1.5,
  '15m': 1.0,
  '5m': 0.7,
};

// ---- Signal descriptions ----
const SIGNAL_LABELS: Record<SignalType, string> = {
  bollinger_breakout_up: '布林上轨突破',
  bollinger_breakout_down: '布林下轨跌破',
  macd_golden_cross: 'MACD 金叉',
  macd_death_cross: 'MACD 死叉',
  rsi_oversold_reversal: 'RSI 超卖反转',
  rsi_overbought_reversal: 'RSI 超买回落',
  volatility_surge: '波动率突增',
  large_body_candle: '大实体K线',
  key_level_breakout: '关键位突破',
  multi_timeframe_resonance: '多周期共振',
  third_buy_candidate: '三买候选',
  third_buy_confirmed: '三买确认',
};

export function getSignalLabel(type: SignalType): string {
  return SIGNAL_LABELS[type] ?? type;
}

export function getSignalColor(type: SignalType): string {
  switch (type) {
    case 'bollinger_breakout_up':
    case 'macd_golden_cross':
    case 'rsi_oversold_reversal':
    case 'key_level_breakout':
      return '#22c55e'; // green
    case 'third_buy_candidate':
      return 'rgba(168,85,247,0.8)'; // purple dim
    case 'third_buy_confirmed':
      return '#a855f7'; // purple bright
    case 'bollinger_breakout_down':
    case 'macd_death_cross':
    case 'rsi_overbought_reversal':
      return '#ef4444'; // red
    case 'volatility_surge':
    case 'large_body_candle':
      return '#f59e0b'; // amber
    case 'multi_timeframe_resonance':
      return '#0ea5e9'; // blue
    default:
      return '#94a3b8';
  }
}

// ============================================================
// Signal Detection Functions
// ============================================================

export function detectBollingerSignals(
  bars: OHLCBar[],
  bollinger: BollingerPoint[],
  symbol: string,
  timeframe: Timeframe,
  market: MarketType
): Signal[] {
  const signals: Signal[] = [];
  if (bars.length < 2 || bollinger.length < 2) return signals;

  const lastBar = bars[bars.length - 1];
  const prevBar = bars[bars.length - 2];
  const lastBoll = bollinger[bollinger.length - 1];
  const prevBoll = bollinger[bollinger.length - 2];

  // Breakout up: close crosses above upper band
  if (prevBar.close <= prevBoll.upper && lastBar.close > lastBoll.upper) {
    if (!isDuplicate(symbol, timeframe, 'bollinger_breakout_up')) {
      const strength = Math.min(100, 40 + TF_WEIGHT[timeframe] * 15);
      signals.push({
        id: nanoid(),
        symbol, market, timeframe,
        type: 'bollinger_breakout_up',
        strength,
        price: lastBar.close,
        time: Date.now(),
        description: `${symbol} 收盘价上穿布林上轨 ${lastBoll.upper.toFixed(4)}`,
        keyLevels: { zhongshuHigh: lastBoll.upper },
      });
      markTriggered(symbol, timeframe, 'bollinger_breakout_up');
    }
  }

  // Breakout down: close crosses below lower band
  if (prevBar.close >= prevBoll.lower && lastBar.close < lastBoll.lower) {
    if (!isDuplicate(symbol, timeframe, 'bollinger_breakout_down')) {
      const strength = Math.min(100, 40 + TF_WEIGHT[timeframe] * 15);
      signals.push({
        id: nanoid(),
        symbol, market, timeframe,
        type: 'bollinger_breakout_down',
        strength,
        price: lastBar.close,
        time: Date.now(),
        description: `${symbol} 收盘价下破布林下轨 ${lastBoll.lower.toFixed(4)}`,
        keyLevels: { zhongshuLow: lastBoll.lower },
      });
      markTriggered(symbol, timeframe, 'bollinger_breakout_down');
    }
  }

  return signals;
}

export function detectMACDSignals(
  macd: MACDPoint[],
  symbol: string,
  timeframe: Timeframe,
  market: MarketType,
  currentPrice: number
): Signal[] {
  const signals: Signal[] = [];
  if (macd.length < 2) return signals;

  const last = macd[macd.length - 1];
  const prev = macd[macd.length - 2];

  // Golden cross: DIF crosses above DEA
  if (prev.dif <= prev.dea && last.dif > last.dea) {
    if (!isDuplicate(symbol, timeframe, 'macd_golden_cross')) {
      let strength = 30 + TF_WEIGHT[timeframe] * 12;
      // Near zero axis bonus
      if (Math.abs(last.dif) < Math.abs(last.dif) * 0.1) strength += 10;
      signals.push({
        id: nanoid(),
        symbol, market, timeframe,
        type: 'macd_golden_cross',
        strength: Math.min(100, strength),
        price: currentPrice,
        time: Date.now(),
        description: `${symbol} MACD 金叉 (DIF=${last.dif.toFixed(4)}, DEA=${last.dea.toFixed(4)})`,
      });
      markTriggered(symbol, timeframe, 'macd_golden_cross');
    }
  }

  // Death cross: DIF crosses below DEA
  if (prev.dif >= prev.dea && last.dif < last.dea) {
    if (!isDuplicate(symbol, timeframe, 'macd_death_cross')) {
      const strength = Math.min(100, 30 + TF_WEIGHT[timeframe] * 12);
      signals.push({
        id: nanoid(),
        symbol, market, timeframe,
        type: 'macd_death_cross',
        strength,
        price: currentPrice,
        time: Date.now(),
        description: `${symbol} MACD 死叉 (DIF=${last.dif.toFixed(4)}, DEA=${last.dea.toFixed(4)})`,
      });
      markTriggered(symbol, timeframe, 'macd_death_cross');
    }
  }

  return signals;
}

export function detectRSISignals(
  rsi: RSIPoint[],
  symbol: string,
  timeframe: Timeframe,
  market: MarketType,
  currentPrice: number
): Signal[] {
  const signals: Signal[] = [];
  if (rsi.length < 2) return signals;

  const last = rsi[rsi.length - 1];
  const prev = rsi[rsi.length - 2];

  // Oversold reversal: RSI crosses above 30
  if (prev.value <= 30 && last.value > 30) {
    if (!isDuplicate(symbol, timeframe, 'rsi_oversold_reversal')) {
      const strength = Math.min(100, 35 + TF_WEIGHT[timeframe] * 15);
      signals.push({
        id: nanoid(),
        symbol, market, timeframe,
        type: 'rsi_oversold_reversal',
        strength,
        price: currentPrice,
        time: Date.now(),
        description: `${symbol} RSI 上穿30超卖线 (RSI=${last.value.toFixed(1)})`,
      });
      markTriggered(symbol, timeframe, 'rsi_oversold_reversal');
    }
  }

  // Overbought reversal: RSI crosses below 70
  if (prev.value >= 70 && last.value < 70) {
    if (!isDuplicate(symbol, timeframe, 'rsi_overbought_reversal')) {
      const strength = Math.min(100, 35 + TF_WEIGHT[timeframe] * 15);
      signals.push({
        id: nanoid(),
        symbol, market, timeframe,
        type: 'rsi_overbought_reversal',
        strength,
        price: currentPrice,
        time: Date.now(),
        description: `${symbol} RSI 下穿70超买线 (RSI=${last.value.toFixed(1)})`,
      });
      markTriggered(symbol, timeframe, 'rsi_overbought_reversal');
    }
  }

  return signals;
}

export function detectVolatilitySignals(
  bars: OHLCBar[],
  symbol: string,
  timeframe: Timeframe,
  market: MarketType
): Signal[] {
  const signals: Signal[] = [];
  if (bars.length < 20) return signals;

  const atr = calcATR(bars, 14);
  const lastAtr = atr[atr.length - 1];
  const prevAtr = atr[atr.length - 6]; // 5 bars ago

  if (!isNaN(lastAtr) && !isNaN(prevAtr) && prevAtr > 0) {
    const atrChange = (lastAtr - prevAtr) / prevAtr;
    if (atrChange > 0.3) { // ATR increased 30%+
      if (!isDuplicate(symbol, timeframe, 'volatility_surge')) {
        const strength = Math.min(100, 25 + atrChange * 50);
        signals.push({
          id: nanoid(),
          symbol, market, timeframe,
          type: 'volatility_surge',
          strength,
          price: bars[bars.length - 1].close,
          time: Date.now(),
          description: `${symbol} 波动率突增 ATR+${(atrChange * 100).toFixed(0)}%`,
        });
        markTriggered(symbol, timeframe, 'volatility_surge');
      }
    }
  }

  // Large body candle
  const lastBar = bars[bars.length - 1];
  const bodySize = Math.abs(lastBar.close - lastBar.open);
  const avgBody = bars.slice(-20).reduce((s, b) => s + Math.abs(b.close - b.open), 0) / 20;
  if (bodySize > avgBody * 2.5) {
    if (!isDuplicate(symbol, timeframe, 'large_body_candle')) {
      signals.push({
        id: nanoid(),
        symbol, market, timeframe,
        type: 'large_body_candle',
        strength: Math.min(100, 20 + TF_WEIGHT[timeframe] * 10),
        price: lastBar.close,
        time: Date.now(),
        description: `${symbol} 大实体K线 (实体=${(bodySize / avgBody).toFixed(1)}x均值)`,
      });
      markTriggered(symbol, timeframe, 'large_body_candle');
    }
  }

  return signals;
}

export function detectKeyLevelBreakout(
  bars: OHLCBar[],
  symbol: string,
  timeframe: Timeframe,
  market: MarketType
): Signal[] {
  const signals: Signal[] = [];
  if (bars.length < 20) return signals;

  const lookback = Math.min(20, bars.length - 1);
  const recentBars = bars.slice(-lookback - 1, -1);
  const lastBar = bars[bars.length - 1];
  const prevBar = bars[bars.length - 2];

  const prevHigh = Math.max(...recentBars.map(b => b.high));
  const prevLow = Math.min(...recentBars.map(b => b.low));

  if (prevBar.close <= prevHigh && lastBar.close > prevHigh) {
    if (!isDuplicate(symbol, timeframe, 'key_level_breakout')) {
      const strength = Math.min(100, 45 + TF_WEIGHT[timeframe] * 15);
      signals.push({
        id: nanoid(),
        symbol, market, timeframe,
        type: 'key_level_breakout',
        strength,
        price: lastBar.close,
        time: Date.now(),
        description: `${symbol} 突破近${lookback}根K线前高 ${prevHigh.toFixed(4)}`,
        keyLevels: { zhongshuHigh: prevHigh },
      });
      markTriggered(symbol, timeframe, 'key_level_breakout');
    }
  }

  return signals;
}

export function convertThirdBuyToSignal(tb: ThirdBuySignal): Signal {
  const isConfirmed = tb.status === 'confirmed';
  const type: SignalType = isConfirmed ? 'third_buy_confirmed' : 'third_buy_candidate';
  const strength = isConfirmed ? 85 : 55;

  return {
    id: tb.id,
    symbol: tb.symbol,
    market: tb.market,
    timeframe: tb.timeframe,
    type,
    strength,
    price: tb.confirmPrice ?? tb.pullbackLow ?? tb.breakoutPrice,
    time: (tb.confirmTime ?? tb.pullbackTime ?? tb.breakoutTime) * 1000,
    description: isConfirmed
      ? `${tb.symbol} 三买确认 中枢[${tb.zhongshu.low.toFixed(4)}-${tb.zhongshu.high.toFixed(4)}]`
      : `${tb.symbol} 三买候选 回抽未入中枢 低点${tb.pullbackLow?.toFixed(4) ?? '-'}`,
    keyLevels: {
      zhongshuHigh: tb.zhongshu.high,
      zhongshuLow: tb.zhongshu.low,
      pullbackLow: tb.pullbackLow,
      confirmPrice: tb.confirmPrice,
    },
  };
}

// ============================================================
// Global Signal Store
// ============================================================

export class SignalStore {
  private signals: Signal[] = [];
  private listeners: Set<(signals: Signal[]) => void> = new Set();
  private maxSignals = 500;

  addSignals(newSignals: Signal[]): void {
    if (newSignals.length === 0) return;
    this.signals = [...newSignals, ...this.signals].slice(0, this.maxSignals);
    this.notify();
  }

  getSignals(): Signal[] {
    return this.signals;
  }

  subscribe(cb: (signals: Signal[]) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach(cb => cb(this.signals));
  }

  clearAll(): void {
    this.signals = [];
    this.notify();
  }
}

export const globalSignalStore = new SignalStore();
