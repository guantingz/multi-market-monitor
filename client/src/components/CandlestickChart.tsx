// ============================================================
// Multi-Market Live Monitor — Candlestick Chart
// Uses lightweight-charts v5 for OHLC + Bollinger + MA + Chanlun
// Design: Quant Terminal (Deep Navy Dark)
//
// MA Color System:
//   MA5   #facc15 (yellow)
//   MA10  #f97316 (orange)
//   MA20  #22d3ee (cyan)
//   MA30  #a78bfa (violet)
//   MA60  #f472b6 (pink)
//   MA120 #4ade80 (green)
//   MA250 #fb923c (amber)
// ============================================================

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type Time,
  type SeriesMarker,
} from 'lightweight-charts';
import { getRealKlines } from '@/lib/realDataAdapter';
import { calcBollinger, computeIndicators, computeAllMA, MA_CONFIGS } from '@/lib/indicators';
import { runChanlun } from '@/lib/chanlunEngine';
import type { MarketType, Timeframe, OHLCBar } from '@/lib/types';
import { useMarketContext } from '@/contexts/MarketContext';
import {
  detectBollingerSignals,
  detectMACDSignals,
  detectRSISignals,
  detectVolatilitySignals,
  detectKeyLevelBreakout,
  convertThirdBuyToSignal,
} from '@/lib/signalEngine';

interface CandlestickChartProps {
  symbol: string;
  market: MarketType;
  timeframe: Timeframe;
  height?: number;
}

// MA series refs map: period -> series
type MASeriesMap = Map<number, ISeriesApi<'Line'>>;

export default function CandlestickChart({ symbol, market, timeframe, height = 380 }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const upperBandRef = useRef<ISeriesApi<'Line'> | null>(null);
  const middleBandRef = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerBandRef = useRef<ISeriesApi<'Line'> | null>(null);
  const maSeriesRef = useRef<MASeriesMap>(new Map());
  const barsRef = useRef<OHLCBar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { indicators, addSignals } = useMarketContext();

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b7fa3',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(30, 45, 74, 0.6)' },
        horzLines: { color: 'rgba(30, 45, 74, 0.6)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(14, 165, 233, 0.5)', width: 1, style: 3 },
        horzLine: { color: 'rgba(14, 165, 233, 0.5)', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: '#1e2d4a',
        textColor: '#6b7fa3',
      },
      timeScale: {
        borderColor: '#1e2d4a',
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height,
    });

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // Bollinger bands
    const upperBand = chart.addSeries(LineSeries, {
      color: 'rgba(14, 165, 233, 0.7)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const middleBand = chart.addSeries(LineSeries, {
      color: 'rgba(14, 165, 233, 0.4)',
      lineWidth: 1,
      lineStyle: 0,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const lowerBand = chart.addSeries(LineSeries, {
      color: 'rgba(14, 165, 233, 0.7)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // MA series — one per period
    const maMap: MASeriesMap = new Map();
    for (const cfg of MA_CONFIGS) {
      const maSeries = chart.addSeries(LineSeries, {
        color: cfg.color,
        lineWidth: cfg.width as 1 | 2 | 3 | 4,
        lineStyle: 0,
        priceLineVisible: false,
        lastValueVisible: true,
        title: cfg.label,
        visible: false, // start hidden; controlled by indicators state
      });
      maMap.set(cfg.period, maSeries);
    }

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    upperBandRef.current = upperBand;
    middleBandRef.current = middleBand;
    lowerBandRef.current = lowerBand;
    maSeriesRef.current = maMap;

    // Resize observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      upperBandRef.current = null;
      middleBandRef.current = null;
      lowerBandRef.current = null;
      maSeriesRef.current = new Map();
    };
  }, [height]);

  // Load data
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    // Request 300 bars to ensure MA250 has enough data
    getRealKlines(symbol, market, timeframe, 300).then(newBars => {
      if (!mounted) return;
      barsRef.current = newBars;
      setIsLoading(false);
      updateChart(newBars);
      runSignalDetection(newBars);
    });

    const interval = setInterval(async () => {
      const newBars = await getRealKlines(symbol, market, timeframe, 300);
      if (!mounted) return;
      barsRef.current = newBars;
      updateChart(newBars);
    }, 30000);

    return () => { mounted = false; clearInterval(interval); };
  }, [symbol, market, timeframe]);

  // Update Bollinger visibility
  useEffect(() => {
    if (!upperBandRef.current || !middleBandRef.current || !lowerBandRef.current) return;
    const visible = indicators.bollinger;
    upperBandRef.current.applyOptions({ visible });
    middleBandRef.current.applyOptions({ visible });
    lowerBandRef.current.applyOptions({ visible });
  }, [indicators.bollinger]);

  // Update MA visibility based on indicators.ma (object keyed by period)
  useEffect(() => {
    const maToggles = (indicators as Record<string, unknown>).maToggles as Record<number, boolean> | undefined;
    for (const cfg of MA_CONFIGS) {
      const series = maSeriesRef.current.get(cfg.period);
      if (!series) continue;
      // If maToggles exists use it; otherwise fall back to global indicators.ma
      const visible = maToggles
        ? (maToggles[cfg.period] ?? false)
        : (indicators.ma ?? false);
      series.applyOptions({ visible });
    }
  }, [(indicators as Record<string, unknown>).maToggles, indicators.ma]);

  function updateChart(newBars: OHLCBar[]) {
    if (!candleSeriesRef.current || !upperBandRef.current || !middleBandRef.current || !lowerBandRef.current) return;

    // Candles
    const candleData: CandlestickData[] = newBars.map(b => ({
      time: b.time as Time,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    candleSeriesRef.current.setData(candleData);

    // Bollinger bands
    const boll = calcBollinger(newBars);
    upperBandRef.current.setData(boll.map(b => ({ time: b.time as Time, value: b.upper })));
    middleBandRef.current.setData(boll.map(b => ({ time: b.time as Time, value: b.middle })));
    lowerBandRef.current.setData(boll.map(b => ({ time: b.time as Time, value: b.lower })));

    // MA lines
    const allMA = computeAllMA(newBars);
    for (const cfg of MA_CONFIGS) {
      const series = maSeriesRef.current.get(cfg.period);
      if (!series) continue;
      const maData: LineData[] = (allMA[cfg.period] ?? []).map(p => ({
        time: p.time as Time,
        value: p.value,
      }));
      series.setData(maData);
    }

    // Chanlun markers
    drawChanlunMarkers(newBars);
  }

  function drawChanlunMarkers(newBars: OHLCBar[]) {
    if (!candleSeriesRef.current) return;
    const result = runChanlun(newBars, market, symbol, timeframe);
    if (result.thirdBuys.length > 0) {
      const markers: SeriesMarker<Time>[] = result.thirdBuys.map(tb => ({
        time: (tb.confirmTime ?? tb.pullbackTime ?? tb.breakoutTime) as Time,
        position: 'belowBar' as const,
        color: tb.status === 'confirmed' ? '#a855f7' : 'rgba(168,85,247,0.6)',
        shape: tb.status === 'confirmed' ? 'arrowUp' as const : 'circle' as const,
        text: tb.status === 'confirmed' ? '3B' : '3B?',
        size: tb.status === 'confirmed' ? 2 : 1,
      }));
      try { createSeriesMarkers(candleSeriesRef.current, markers); } catch { /* ignore */ }
    }
  }

  function runSignalDetection(newBars: OHLCBar[]) {
    const indicatorData = computeIndicators(newBars);
    const currentPrice = newBars[newBars.length - 1]?.close ?? 0;
    const signals = [
      ...detectBollingerSignals(newBars, indicatorData.bollinger, symbol, timeframe, market),
      ...detectMACDSignals(indicatorData.macd, symbol, timeframe, market, currentPrice),
      ...detectRSISignals(indicatorData.rsi, symbol, timeframe, market, currentPrice),
      ...detectVolatilitySignals(newBars, symbol, timeframe, market),
      ...detectKeyLevelBreakout(newBars, symbol, timeframe, market),
    ];
    const chanlun = runChanlun(newBars, market, symbol, timeframe);
    signals.push(...chanlun.thirdBuys.map(convertThirdBuyToSignal));
    if (signals.length > 0) addSignals(signals);
  }

  return (
    <div className="relative" style={{ background: 'oklch(0.10 0.022 240)', borderRadius: 4 }}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: 'oklch(0.10 0.022 240)', borderRadius: 4 }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#0ea5e9', borderTopColor: 'transparent' }}
            />
            <span style={{ fontSize: 11, color: '#6b7fa3' }}>加载K线数据...</span>
          </div>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height }} />
    </div>
  );
}
