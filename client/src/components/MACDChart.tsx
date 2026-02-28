// ============================================================
// Multi-Market Live Monitor — MACD Sub-chart
// Uses lightweight-charts v5
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type HistogramData,
  type Time,
} from 'lightweight-charts';
import { getRealKlines } from '@/lib/realDataAdapter';
import { calcMACD } from '@/lib/indicators';
import type { MarketType, Timeframe } from '@/lib/types';

interface MACDChartProps {
  symbol: string;
  market: MarketType;
  timeframe: Timeframe;
  height?: number;
  visible?: boolean;
}

export default function MACDChart({ symbol, market, timeframe, height = 120, visible = true }: MACDChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const difRef = useRef<ISeriesApi<'Line'> | null>(null);
  const deaRef = useRef<ISeriesApi<'Line'> | null>(null);
  const histRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b7fa3',
        fontSize: 9,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(30, 45, 74, 0.4)' },
        horzLines: { color: 'rgba(30, 45, 74, 0.4)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(14, 165, 233, 0.4)', width: 1, style: 3 },
        horzLine: { color: 'rgba(14, 165, 233, 0.4)', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: '#1e2d4a',
        textColor: '#6b7fa3',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#1e2d4a',
        timeVisible: true,
        secondsVisible: false,
        visible: false,
      },
      width: containerRef.current.clientWidth,
      height,
    });

    const dif = chart.addSeries(LineSeries, {
      color: '#0ea5e9',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    const dea = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    const hist = chart.addSeries(HistogramSeries, {
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    difRef.current = dif;
    deaRef.current = dea;
    histRef.current = hist;

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
    };
  }, [height]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const bars = await getRealKlines(symbol, market, timeframe, 200);
      if (!mounted || !difRef.current || !deaRef.current || !histRef.current) return;

      const macd = calcMACD(bars);
      const difData: LineData[] = macd.map(m => ({ time: m.time as Time, value: m.dif }));
      const deaData: LineData[] = macd.map(m => ({ time: m.time as Time, value: m.dea }));
      const histData: HistogramData[] = macd.map(m => ({
        time: m.time as Time,
        value: m.histogram,
        color: m.histogram >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)',
      }));

      difRef.current.setData(difData);
      deaRef.current.setData(deaData);
      histRef.current.setData(histData);
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [symbol, market, timeframe]);

  if (!visible) return null;

  return (
    <div>
      <div className="flex items-center gap-3 px-2 py-1">
        <span style={{ fontSize: 10, color: '#6b7fa3', fontFamily: 'Space Grotesk, sans-serif' }}>MACD (12,26,9)</span>
        <span className="flex items-center gap-1">
          <span style={{ width: 12, height: 2, background: '#0ea5e9', display: 'inline-block' }} />
          <span style={{ fontSize: 9, color: '#6b7fa3' }}>DIF</span>
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 12, height: 2, background: '#f59e0b', display: 'inline-block' }} />
          <span style={{ fontSize: 9, color: '#6b7fa3' }}>DEA</span>
        </span>
      </div>
      <div ref={containerRef} style={{ width: '100%', height }} />
    </div>
  );
}
