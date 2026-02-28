// ============================================================
// Multi-Market Live Monitor — Chanlun Engine (缠论引擎)
// Implements: 包含处理 → 分型 → 成笔 → 中枢 → 三买
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import type {
  OHLCBar,
  Fractal,
  FractalType,
  Bi,
  BiDirection,
  Zhongshu,
  ThirdBuySignal,
  ThirdBuyStatus,
  Timeframe,
  MarketType,
} from './types';
import { calcATR } from './indicators';
import { nanoid } from 'nanoid';

// ---- Parameters ----
export interface ChanlunParams {
  minBiKbars: number;       // minimum K bars in a bi
  minBiMoveAtr: number;     // minimum move in ATR multiples
  breakoutAtr: number;      // breakout threshold (ATR multiples)
  pullbackToleranceAtr: number; // pullback tolerance into zhongshu
  confirmRule: 'new_high' | 'break_pullback_high';
}

export const DEFAULT_PARAMS: Record<MarketType, ChanlunParams> = {
  fx: { minBiKbars: 5, minBiMoveAtr: 1.0, breakoutAtr: 0.5, pullbackToleranceAtr: 0.3, confirmRule: 'break_pullback_high' },
  cn: { minBiKbars: 5, minBiMoveAtr: 1.0, breakoutAtr: 0.5, pullbackToleranceAtr: 0.3, confirmRule: 'break_pullback_high' },
  hk: { minBiKbars: 5, minBiMoveAtr: 1.0, breakoutAtr: 0.5, pullbackToleranceAtr: 0.3, confirmRule: 'break_pullback_high' },
  us: { minBiKbars: 5, minBiMoveAtr: 1.0, breakoutAtr: 0.5, pullbackToleranceAtr: 0.3, confirmRule: 'break_pullback_high' },
  crypto: { minBiKbars: 4, minBiMoveAtr: 0.8, breakoutAtr: 0.4, pullbackToleranceAtr: 0.4, confirmRule: 'break_pullback_high' },
  commodities: { minBiKbars: 5, minBiMoveAtr: 1.0, breakoutAtr: 0.5, pullbackToleranceAtr: 0.3, confirmRule: 'break_pullback_high' },
};

// ============================================================
// Step 1: 包含处理 (Containment Processing)
// ============================================================

interface ProcessedBar {
  originalIndex: number;
  time: number;
  high: number;
  low: number;
  close: number;
}

export function processContainment(bars: OHLCBar[]): ProcessedBar[] {
  if (bars.length === 0) return [];
  const result: ProcessedBar[] = [
    { originalIndex: 0, time: bars[0].time, high: bars[0].high, low: bars[0].low, close: bars[0].close },
  ];

  for (let i = 1; i < bars.length; i++) {
    const cur = bars[i];
    const prev = result[result.length - 1];

    // Check containment
    const curContainsPrev = cur.high >= prev.high && cur.low <= prev.low;
    const prevContainsCur = prev.high >= cur.high && prev.low <= cur.low;

    if (curContainsPrev || prevContainsCur) {
      // Determine trend direction from last two processed bars
      let isUpTrend = true;
      if (result.length >= 2) {
        const pp = result[result.length - 2];
        isUpTrend = prev.high > pp.high;
      }

      if (isUpTrend) {
        // Uptrend: take max high, max low
        prev.high = Math.max(prev.high, cur.high);
        prev.low = Math.max(prev.low, cur.low);
      } else {
        // Downtrend: take min high, min low
        prev.high = Math.min(prev.high, cur.high);
        prev.low = Math.min(prev.low, cur.low);
      }
      prev.close = cur.close;
      prev.originalIndex = i;
    } else {
      result.push({
        originalIndex: i,
        time: cur.time,
        high: cur.high,
        low: cur.low,
        close: cur.close,
      });
    }
  }

  return result;
}

// ============================================================
// Step 2: 分型识别 (Fractal Detection)
// ============================================================

export function detectFractals(processed: ProcessedBar[]): Fractal[] {
  const fractals: Fractal[] = [];
  for (let i = 1; i < processed.length - 1; i++) {
    const prev = processed[i - 1];
    const cur = processed[i];
    const next = processed[i + 1];

    if (cur.high > prev.high && cur.high > next.high) {
      fractals.push({ index: i, time: cur.time, price: cur.high, type: 'top' });
    } else if (cur.low < prev.low && cur.low < next.low) {
      fractals.push({ index: i, time: cur.time, price: cur.low, type: 'bottom' });
    }
  }
  return fractals;
}

// ============================================================
// Step 3: 成笔 (Bi Formation)
// ============================================================

export function formBis(
  fractals: Fractal[],
  processed: ProcessedBar[],
  atrValues: number[],
  params: ChanlunParams
): Bi[] {
  if (fractals.length < 2) return [];

  const bis: Bi[] = [];
  let biId = 0;

  // Filter alternating top/bottom fractals
  const filtered: Fractal[] = [fractals[0]];
  for (let i = 1; i < fractals.length; i++) {
    const last = filtered[filtered.length - 1];
    const cur = fractals[i];
    if (cur.type !== last.type) {
      filtered.push(cur);
    } else {
      // Same type: keep the more extreme one
      if (cur.type === 'top' && cur.price > last.price) {
        filtered[filtered.length - 1] = cur;
      } else if (cur.type === 'bottom' && cur.price < last.price) {
        filtered[filtered.length - 1] = cur;
      }
    }
  }

  for (let i = 0; i < filtered.length - 1; i++) {
    const start = filtered[i];
    const end = filtered[i + 1];

    // Check minimum K bar count
    const kbarCount = end.index - start.index;
    if (kbarCount < params.minBiKbars) continue;

    // Check minimum move
    const avgAtr = getAvgATR(atrValues, start.index, end.index);
    const move = Math.abs(end.price - start.price);
    if (avgAtr > 0 && move < params.minBiMoveAtr * avgAtr) continue;

    const direction: BiDirection = start.type === 'bottom' ? 'up' : 'down';

    bis.push({
      id: biId++,
      direction,
      startFractal: start,
      endFractal: end,
      kbarCount,
    });
  }

  return bis;
}

function getAvgATR(atrValues: number[], startIdx: number, endIdx: number): number {
  let sum = 0;
  let count = 0;
  for (let i = startIdx; i <= endIdx && i < atrValues.length; i++) {
    if (!isNaN(atrValues[i])) {
      sum += atrValues[i];
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

// ============================================================
// Step 4: 中枢识别 (Zhongshu Detection)
// ============================================================

export function detectZhongshu(bis: Bi[]): Zhongshu[] {
  if (bis.length < 3) return [];
  const zhongshus: Zhongshu[] = [];
  let zId = 0;

  for (let i = 0; i <= bis.length - 3; i++) {
    const b1 = bis[i];
    const b2 = bis[i + 1];
    const b3 = bis[i + 2];

    // Get price ranges of three consecutive bis
    const range1 = getBiRange(b1);
    const range2 = getBiRange(b2);
    const range3 = getBiRange(b3);

    // Overlap of all three
    const zHigh = Math.min(range1.high, range2.high, range3.high);
    const zLow = Math.max(range1.low, range2.low, range3.low);

    if (zHigh <= zLow) continue; // No overlap

    // Check if existing zhongshu can be extended
    const lastZ = zhongshus[zhongshus.length - 1];
    if (lastZ && lastZ.isActive && b1.id >= lastZ.biIds[lastZ.biIds.length - 1]) {
      // Try to extend
      const biRange = getBiRange(b3);
      if (biRange.high >= lastZ.low && biRange.low <= lastZ.high) {
        lastZ.endTime = b3.endFractal.time;
        lastZ.biIds.push(b3.id);
        continue;
      }
    }

    zhongshus.push({
      id: zId++,
      high: zHigh,
      low: zLow,
      startTime: b1.startFractal.time,
      endTime: b3.endFractal.time,
      biIds: [b1.id, b2.id, b3.id],
      isActive: true,
    });
  }

  return zhongshus;
}

function getBiRange(bi: Bi): { high: number; low: number } {
  return {
    high: Math.max(bi.startFractal.price, bi.endFractal.price),
    low: Math.min(bi.startFractal.price, bi.endFractal.price),
  };
}

// ============================================================
// Step 5: 三买识别 (Third Buy Detection)
// ============================================================

export function detectThirdBuys(
  bis: Bi[],
  zhongshus: Zhongshu[],
  atrValues: number[],
  params: ChanlunParams,
  symbol: string,
  timeframe: Timeframe,
  market: MarketType
): ThirdBuySignal[] {
  const signals: ThirdBuySignal[] = [];

  for (const z of zhongshus) {
    // Find bis after the zhongshu
    const lastBiId = z.biIds[z.biIds.length - 1];
    const lastBiIdx = bis.findIndex(b => b.id === lastBiId);
    if (lastBiIdx < 0 || lastBiIdx >= bis.length - 1) continue;

    // Step 1: Find breakout bi (upward bi that breaks Z.high)
    let breakoutBi: Bi | null = null;
    let breakoutIdx = -1;
    for (let i = lastBiIdx + 1; i < bis.length; i++) {
      const bi = bis[i];
      if (bi.direction === 'up' && bi.endFractal.price > z.high) {
        const avgAtr = getAvgATR(atrValues, bi.startFractal.index, bi.endFractal.index);
        if (bi.endFractal.price - z.high >= params.breakoutAtr * avgAtr) {
          breakoutBi = bi;
          breakoutIdx = i;
          break;
        }
      }
    }
    if (!breakoutBi) continue;

    // Step 2: Find pullback bi (downward bi after breakout)
    if (breakoutIdx + 1 >= bis.length) {
      // Breakout happened but no pullback yet - candidate in progress
      signals.push({
        id: nanoid(),
        zhongshu: z,
        status: 'candidate',
        breakoutTime: breakoutBi.endFractal.time,
        breakoutPrice: breakoutBi.endFractal.price,
        symbol,
        timeframe,
        market,
      });
      continue;
    }

    const pullbackBi = bis[breakoutIdx + 1];
    if (pullbackBi.direction !== 'down') continue;

    const pullbackLow = pullbackBi.endFractal.price;
    const avgAtr = getAvgATR(atrValues, pullbackBi.startFractal.index, pullbackBi.endFractal.index);
    const tolerance = params.pullbackToleranceAtr * avgAtr;

    // Check pullback doesn't enter zhongshu
    if (pullbackLow < z.high - tolerance) {
      // Pullback entered zhongshu - candidate invalid
      continue;
    }

    // Candidate confirmed: pullback held above Z.high
    const candidateSignal: ThirdBuySignal = {
      id: nanoid(),
      zhongshu: z,
      status: 'candidate',
      breakoutTime: breakoutBi.endFractal.time,
      breakoutPrice: breakoutBi.endFractal.price,
      pullbackLow,
      pullbackTime: pullbackBi.endFractal.time,
      symbol,
      timeframe,
      market,
    };

    // Step 3: Find confirmation bi
    if (breakoutIdx + 2 >= bis.length) {
      signals.push(candidateSignal);
      continue;
    }

    const confirmBi = bis[breakoutIdx + 2];
    if (confirmBi.direction !== 'up') {
      signals.push(candidateSignal);
      continue;
    }

    // Check confirmation condition
    let confirmed = false;
    if (params.confirmRule === 'new_high') {
      confirmed = confirmBi.endFractal.price > breakoutBi.endFractal.price;
    } else {
      // break_pullback_high: break above pullback start
      confirmed = confirmBi.endFractal.price > pullbackBi.startFractal.price;
    }

    if (confirmed) {
      signals.push({
        ...candidateSignal,
        id: nanoid(),
        status: 'confirmed',
        confirmTime: confirmBi.endFractal.time,
        confirmPrice: confirmBi.endFractal.price,
      });
    } else {
      signals.push(candidateSignal);
    }
  }

  return signals;
}

// ============================================================
// Main Entry: Run full Chanlun analysis
// ============================================================

export interface ChanlunResult {
  processedBars: ProcessedBar[];
  fractals: Fractal[];
  bis: Bi[];
  zhongshus: Zhongshu[];
  thirdBuys: ThirdBuySignal[];
}

export function runChanlun(
  bars: OHLCBar[],
  market: MarketType,
  symbol: string,
  timeframe: Timeframe,
  params?: Partial<ChanlunParams>
): ChanlunResult {
  const p = { ...DEFAULT_PARAMS[market], ...params };
  const atrValues = calcATR(bars, 14);

  const processedBars = processContainment(bars);
  const fractals = detectFractals(processedBars);
  const bis = formBis(fractals, processedBars, atrValues, p);
  const zhongshus = detectZhongshu(bis);
  const thirdBuys = detectThirdBuys(bis, zhongshus, atrValues, p, symbol, timeframe, market);

  return { processedBars, fractals, bis, zhongshus, thirdBuys };
}
