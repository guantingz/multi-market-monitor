// ============================================================
// Multi-Market Live Monitor — Technical Indicators Service
// Implements: MACD, RSI, Bollinger Bands, ATR
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import type { OHLCBar, MACDPoint, RSIPoint, BollingerPoint, IndicatorData } from './types';

// ---- EMA ----
export function calcEMA(values: number[], period: number): number[] {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  const result: number[] = new Array(values.length).fill(NaN);

  // First EMA = SMA
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  result[period - 1] = sum / period;

  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

// ---- SMA ----
export function calcSMA(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += values[j];
    result[i] = sum / period;
  }
  return result;
}

// ---- MACD ----
export function calcMACD(
  bars: OHLCBar[],
  fast = 12,
  slow = 26,
  signal = 9
): MACDPoint[] {
  if (bars.length < slow + signal) return [];
  const closes = bars.map(b => b.close);
  const emaFast = calcEMA(closes, fast);
  const emaSlow = calcEMA(closes, slow);

  const difValues: number[] = closes.map((_, i) => {
    if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) return NaN;
    return emaFast[i] - emaSlow[i];
  });

  // Signal line = EMA of DIF
  const validDif = difValues.filter(v => !isNaN(v));
  const deaRaw = calcEMA(validDif, signal);

  const result: MACDPoint[] = [];
  let deaIdx = 0;
  for (let i = 0; i < bars.length; i++) {
    if (isNaN(difValues[i])) continue;
    const dif = difValues[i];
    const dea = deaRaw[deaIdx] ?? NaN;
    deaIdx++;
    if (isNaN(dea)) continue;
    result.push({
      time: bars[i].time,
      dif,
      dea,
      histogram: (dif - dea) * 2,
    });
  }
  return result;
}

// ---- RSI ----
export function calcRSI(bars: OHLCBar[], period = 14): RSIPoint[] {
  if (bars.length < period + 1) return [];
  const closes = bars.map(b => b.close);
  const result: RSIPoint[] = [];

  let avgGain = 0;
  let avgLoss = 0;

  // Initial average
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= period;
  avgLoss /= period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({ time: bars[period].time, value: 100 - 100 / (1 + rs) });

  for (let i = period + 1; i < bars.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs2 = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({ time: bars[i].time, value: 100 - 100 / (1 + rs2) });
  }

  return result;
}

// ---- Bollinger Bands ----
export function calcBollinger(
  bars: OHLCBar[],
  period = 20,
  stdDev = 2
): BollingerPoint[] {
  if (bars.length < period) return [];
  const closes = bars.map(b => b.close);
  const result: BollingerPoint[] = [];

  for (let i = period - 1; i < bars.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    result.push({
      time: bars[i].time,
      upper: mean + stdDev * std,
      middle: mean,
      lower: mean - stdDev * std,
    });
  }
  return result;
}

// ---- ATR ----
export function calcATR(bars: OHLCBar[], period = 14): number[] {
  if (bars.length < 2) return [];
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const hl = bars[i].high - bars[i].low;
    const hc = Math.abs(bars[i].high - bars[i - 1].close);
    const lc = Math.abs(bars[i].low - bars[i - 1].close);
    trs.push(Math.max(hl, hc, lc));
  }
  const result: number[] = new Array(bars.length).fill(NaN);
  if (trs.length < period) return result;

  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result[period] = atr;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
    result[i + 1] = atr;
  }
  return result;
}

// ---- Moving Average (MA) ----
export interface MAPoint {
  time: number;
  value: number;
}

export function calcMA(bars: OHLCBar[], period: number): MAPoint[] {
  if (bars.length < period) return [];
  const result: MAPoint[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += bars[j].close;
    result.push({ time: bars[i].time, value: sum / period });
  }
  return result;
}

// MA system configuration
export const MA_CONFIGS = [
  { period: 5,   color: '#facc15', label: 'MA5',   width: 1 },
  { period: 10,  color: '#f97316', label: 'MA10',  width: 1 },
  { period: 20,  color: '#22d3ee', label: 'MA20',  width: 1 },
  { period: 30,  color: '#a78bfa', label: 'MA30',  width: 1 },
  { period: 60,  color: '#f472b6', label: 'MA60',  width: 1.5 },
  { period: 120, color: '#4ade80', label: 'MA120', width: 1.5 },
  { period: 250, color: '#fb923c', label: 'MA250', width: 2 },
] as const;

export type MAPeriod = typeof MA_CONFIGS[number]['period'];

export function computeAllMA(bars: OHLCBar[]): Record<number, MAPoint[]> {
  const result: Record<number, MAPoint[]> = {};
  for (const cfg of MA_CONFIGS) {
    result[cfg.period] = calcMA(bars, cfg.period);
  }
  return result;
}

// ---- Compute all indicators ----
export function computeIndicators(bars: OHLCBar[]): IndicatorData {
  return {
    macd: calcMACD(bars),
    rsi: calcRSI(bars),
    bollinger: calcBollinger(bars),
  };
}
