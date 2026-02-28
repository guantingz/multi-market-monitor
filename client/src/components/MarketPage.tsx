// ============================================================
// Multi-Market Live Monitor — Market Page (Unified Layout)
// Used by all 6 market pages: FX, CN, HK, US, Crypto, Commodities
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useState } from 'react';
import { useMarketContext } from '@/contexts/MarketContext';
import type { MarketType } from '@/lib/types';
import { MA_CONFIGS } from '@/lib/indicators';
import MarketHeader from './MarketHeader';
import Watchlist from './Watchlist';
import QuoteCard from './QuoteCard';
import CandlestickChart from './CandlestickChart';
import MACDChart from './MACDChart';
import RSIChart from './RSIChart';
import SignalTimeline from './SignalTimeline';
import ChanlunOverlay from './ChanlunOverlay';

interface MarketPageProps {
  market: MarketType;
}

export default function MarketPage({ market }: MarketPageProps) {
  const { selectedSymbols, selectedTimeframes, indicators, toggleMA, toggleAllMA } = useMarketContext();
  const symbol = selectedSymbols[market];
  const timeframe = selectedTimeframes[market];
  const [showMAPanel, setShowMAPanel] = useState(false);

  const activeMACount = Object.values(indicators.maToggles).filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <MarketHeader market={market} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Watchlist */}
        <Watchlist market={market} />

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden" style={{ minWidth: 0 }}>
          {/* Center: Charts */}
          <div className="flex-1 flex flex-col overflow-y-auto" style={{ minWidth: 0 }}>
            {/* Quote card */}
            <div
              className="px-3 py-2 border-b"
              style={{ borderColor: 'oklch(0.20 0.025 240)', flexShrink: 0 }}
            >
              <QuoteCard symbol={symbol} market={market} />
            </div>

            {/* K-line chart */}
            <div className="px-3 pt-2">
              {/* Chart header: legend + MA toggle button */}
              <div className="flex items-center justify-between mb-1">
                <span className="panel-header">K线图 · {symbol} · {timeframe}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Active MA legend pills */}
                  {MA_CONFIGS.filter(cfg => indicators.maToggles[cfg.period]).map(cfg => (
                    <span
                      key={cfg.period}
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => toggleMA(cfg.period)}
                      title={`点击关闭 ${cfg.label}`}
                    >
                      <span style={{ width: 14, height: 2, background: cfg.color, display: 'inline-block', borderRadius: 1 }} />
                      <span style={{ fontSize: 9, color: cfg.color, fontFamily: 'JetBrains Mono, monospace' }}>
                        {cfg.label}
                      </span>
                    </span>
                  ))}

                  {/* Bollinger legend */}
                  {indicators.bollinger && (
                    <span className="flex items-center gap-1">
                      <span style={{ width: 14, height: 0, borderTop: '1px dashed rgba(14,165,233,0.7)', display: 'inline-block' }} />
                      <span style={{ fontSize: 9, color: '#6b7fa3' }}>布林带</span>
                    </span>
                  )}

                  {/* 3B legends */}
                  <span className="flex items-center gap-1">
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a855f7', display: 'inline-block', boxShadow: '0 0 4px #a855f7' }} />
                    <span style={{ fontSize: 9, color: '#6b7fa3' }}>3B确认</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(168,85,247,0.4)', border: '1px solid #a855f7', display: 'inline-block' }} />
                    <span style={{ fontSize: 9, color: '#6b7fa3' }}>3B候选</span>
                  </span>

                  {/* MA toggle button */}
                  <button
                    onClick={() => setShowMAPanel(p => !p)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded transition-colors"
                    style={{
                      background: showMAPanel ? 'rgba(250,204,21,0.12)' : 'oklch(0.14 0.025 240)',
                      border: `1px solid ${showMAPanel ? 'rgba(250,204,21,0.4)' : 'oklch(0.22 0.03 240)'}`,
                      color: showMAPanel ? '#facc15' : '#6b7fa3',
                      fontSize: 10,
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    均线
                    {activeMACount > 0 && (
                      <span
                        className="rounded-full flex items-center justify-center"
                        style={{ width: 14, height: 14, background: '#facc15', color: '#000', fontSize: 8, fontWeight: 700 }}
                      >
                        {activeMACount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* MA Panel (collapsible) */}
              {showMAPanel && (
                <div
                  className="mb-2 rounded px-3 py-2"
                  style={{
                    background: 'oklch(0.09 0.022 240)',
                    border: '1px solid oklch(0.20 0.025 240)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 10, color: '#6b7fa3', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      均线系统
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAllMA(true)}
                        className="px-2 py-0.5 rounded text-xs transition-colors"
                        style={{ background: 'oklch(0.16 0.025 240)', color: '#c8d4e8', fontSize: 9, fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        全开
                      </button>
                      <button
                        onClick={() => toggleAllMA(false)}
                        className="px-2 py-0.5 rounded text-xs transition-colors"
                        style={{ background: 'oklch(0.16 0.025 240)', color: '#6b7fa3', fontSize: 9, fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        全关
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MA_CONFIGS.map(cfg => {
                      const isOn = indicators.maToggles[cfg.period];
                      return (
                        <button
                          key={cfg.period}
                          onClick={() => toggleMA(cfg.period)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded transition-all"
                          style={{
                            background: isOn ? `${cfg.color}18` : 'oklch(0.13 0.025 240)',
                            border: `1px solid ${isOn ? cfg.color : 'oklch(0.22 0.03 240)'}`,
                            boxShadow: isOn ? `0 0 6px ${cfg.color}30` : 'none',
                          }}
                        >
                          {/* Color swatch */}
                          <span
                            style={{
                              width: 20,
                              height: 2,
                              background: isOn ? cfg.color : 'oklch(0.35 0.02 240)',
                              display: 'inline-block',
                              borderRadius: 1,
                              transition: 'background 0.15s',
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: isOn ? 600 : 400,
                              color: isOn ? cfg.color : 'oklch(0.45 0.02 230)',
                              transition: 'color 0.15s',
                            }}
                          >
                            {cfg.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <CandlestickChart
                symbol={symbol}
                market={market}
                timeframe={timeframe}
                height={320}
              />
            </div>

            {/* MACD sub-chart */}
            {indicators.macd && (
              <div
                className="mx-3 mt-1 rounded"
                style={{ background: 'oklch(0.10 0.022 240)', border: '1px solid oklch(0.18 0.025 240)' }}
              >
                <MACDChart
                  symbol={symbol}
                  market={market}
                  timeframe={timeframe}
                  height={100}
                  visible={indicators.macd}
                />
              </div>
            )}

            {/* RSI sub-chart */}
            {indicators.rsi && (
              <div
                className="mx-3 mt-1 rounded"
                style={{ background: 'oklch(0.10 0.022 240)', border: '1px solid oklch(0.18 0.025 240)' }}
              >
                <RSIChart
                  symbol={symbol}
                  market={market}
                  timeframe={timeframe}
                  height={85}
                  visible={indicators.rsi}
                />
              </div>
            )}

            {/* Chanlun panel */}
            <div className="mx-3 mt-1 mb-3">
              <ChanlunOverlay symbol={symbol} market={market} timeframe={timeframe} />
            </div>
          </div>

          {/* Right: Signal timeline */}
          <div
            style={{
              width: 290,
              minWidth: 290,
              borderLeft: '1px solid oklch(0.20 0.025 240)',
              background: 'oklch(0.10 0.022 240)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SignalTimeline symbol={symbol} market={market} maxItems={40} showFilter={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
