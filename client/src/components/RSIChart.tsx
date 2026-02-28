// ============================================================
// Multi-Market Live Monitor — RSI Sub-chart
// Uses lightweight-charts v5
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type Time,
} from 'lightweight-charts';
import { getRealKlines } from '@/lib/realDataAdapter';
import { calcRSI } from '@/lib/indicators';
import type { MarketType, Timeframe } from '@/lib/types';

interface RSIChartProps {
  symbol: string;
  market: MarketType;
  timeframe: Timeframe;
  height?: number;
  visible?: boolean;
}

export default function RSIChart({ symbol, market, timeframe, height = 100, visible = true }: RSIChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ob70Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const os30Ref = useRef<ISeriesApi<'Line'> | null>(null);

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
        scaleMargins: { top: 0.05, bottom: 0.05 },
        autoScale: true,
      },
      timeScale: {
        borderColor: '#1e2d4a',
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height,
    });

    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    // Reference lines at 70 and 30
    const ob70 = chart.addSeries(LineSeries, {
      color: 'rgba(239, 68, 68, 0.4)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const os30 = chart.addSeries(LineSeries, {
      color: 'rgba(34, 197, 94, 0.4)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    rsiRef.current = rsiSeries;
    ob70Ref.current = ob70;
    os30Ref.current = os30;

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
      if (!mounted || !rsiRef.current || !ob70Ref.current || !os30Ref.current) return;

      const rsi = calcRSI(bars);
      const rsiData: LineData[] = rsi.map(r => ({ time: r.time as Time, value: r.value }));
      rsiRef.current.setData(rsiData);

      // Reference lines
      if (rsiData.length > 0) {
        const first = rsiData[0].time;
        const last = rsiData[rsiData.length - 1].time;
        ob70Ref.current.setData([{ time: first, value: 70 }, { time: last, value: 70 }]);
        os30Ref.current.setData([{ time: first, value: 30 }, { time: last, value: 30 }]);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [symbol, market, timeframe]);

  if (!visible) return null;

  return (
    <div>
      <div className="flex items-center gap-3 px-2 py-1">
        <span style={{ fontSize: 10, color: '#6b7fa3', fontFamily: 'Space Grotesk, sans-serif' }}>RSI (14)</span>
        <span className="flex items-center gap-1">
          <span style={{ width: 12, height: 2, background: 'rgba(239,68,68,0.5)', display: 'inline-block', borderTop: '1px dashed rgba(239,68,68,0.5)' }} />
          <span style={{ fontSize: 9, color: '#6b7fa3' }}>70</span>
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 12, height: 2, background: 'rgba(34,197,94,0.5)', display: 'inline-block', borderTop: '1px dashed rgba(34,197,94,0.5)' }} />
          <span style={{ fontSize: 9, color: '#6b7fa3' }}>30</span>
        </span>
      </div>
      <div ref={containerRef} style={{ width: '100%', height }} />
    </div>
  );
}
