// ============================================================
// Multi-Market Live Monitor — Watchlist Component
// Shows symbol list with live quotes for a given market
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { useMarketContext } from '@/contexts/MarketContext';
import { MARKET_SYMBOLS, formatPrice, formatChangePct } from '@/lib/mockDataEngine';
import { getRealQuotesBatch } from '@/lib/realDataAdapter';
import type { MarketType, QuoteSnapshot, Timeframe } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TIMEFRAMES: Timeframe[] = ['1D', '4H', '1H', '15m', '5m'];

interface WatchlistProps {
  market: MarketType;
}

export default function Watchlist({ market }: WatchlistProps) {
  const {
    selectedSymbols, setSelectedSymbol,
    selectedTimeframes, setSelectedTimeframe,
    indicators, toggleIndicator,
    signalSettings, toggleSignalType
  } = useMarketContext();
  const selectedSymbol = selectedSymbols[market];
  const selectedTimeframe = selectedTimeframes[market];

  const [quotes, setQuotes] = useState<Record<string, QuoteSnapshot>>({});
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});
  const prevPrices = useRef<Record<string, number>>({});
  const [showIndicators, setShowIndicators] = useState(false);
  const [showSignals, setShowSignals] = useState(true);

  const symbols = MARKET_SYMBOLS[market];

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const items = symbols.map(s => ({ symbol: s.symbol, market }));
        const qMap = await getRealQuotesBatch(items);
        if (!mounted) return;
        qMap.forEach((q, sym) => {
          const prev = prevPrices.current[sym];
          if (prev !== undefined && prev !== q.price) {
            const dir = q.price > prev ? 'up' : 'down';
            setFlashMap(fm => ({ ...fm, [sym]: dir }));
            setTimeout(() => setFlashMap(fm => {
              const next = { ...fm };
              delete next[sym];
              return next;
            }), 600);
          }
          prevPrices.current[sym] = q.price;
        });
        setQuotes(prev => {
          const next = { ...prev };
          qMap.forEach((q, sym) => { next[sym] = q; });
          return next;
        });
      } catch (e) {
        console.warn('[Watchlist] batch fetch error:', e);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, [market]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        width: 220,
        minWidth: 220,
        background: 'oklch(0.10 0.022 240)',
        borderRight: '1px solid oklch(0.20 0.025 240)',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 border-b"
        style={{ borderColor: 'oklch(0.18 0.025 240)', flexShrink: 0 }}
      >
        <span className="panel-header">品种列表</span>
      </div>

      {/* Symbol list */}
      <div className="flex-1 overflow-y-auto">
        {symbols.map(s => {
          const q = quotes[s.symbol];
          const isSelected = selectedSymbol === s.symbol;
          const flash = flashMap[s.symbol];
          const isUp = q ? q.changePct >= 0 : true;

          return (
            <div
              key={s.symbol}
              className={cn(
                'watchlist-row',
                isSelected && 'active',
                flash === 'up' && 'flash-green',
                flash === 'down' && 'flash-red'
              )}
              onClick={() => setSelectedSymbol(market, s.symbol)}
            >
              <div className="flex-1 min-w-0">
                {/* Symbol + price */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isSelected ? '#e8edf5' : '#8a9fc0',
                      fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {s.symbol}
                  </span>
                  {q ? (
                    <span
                      style={{
                        fontSize: 11,
                        color: isUp ? '#22c55e' : '#ef4444',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600,
                      }}
                    >
                      {formatPrice(q.price, s.symbol)}
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, color: '#4a5a7a' }}>—</span>
                  )}
                </div>

                {/* Name + change% */}
                <div className="flex items-center justify-between mt-0.5">
                  <span
                    style={{ fontSize: 9, color: '#4a5a7a', fontFamily: 'Space Grotesk, sans-serif' }}
                    className="truncate"
                  >
                    {s.name}
                  </span>
                  {q && (
                    <span
                      className="flex items-center gap-0.5"
                      style={{
                        fontSize: 10,
                        color: isUp ? '#22c55e' : '#ef4444',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      {isUp ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                      {Math.abs(q.changePct).toFixed(2)}%
                    </span>
                  )}
                </div>

                {/* H/L */}
                {q && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{ fontSize: 9, color: '#3a4a6a', fontFamily: 'JetBrains Mono, monospace' }}>
                      H:{formatPrice(q.high ?? q.price * 1.005, s.symbol)}
                    </span>
                    <span style={{ fontSize: 9, color: '#3a4a6a', fontFamily: 'JetBrains Mono, monospace' }}>
                      L:{formatPrice(q.low ?? q.price * 0.995, s.symbol)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeframe selector */}
      <div
        className="px-3 py-2 border-t"
        style={{ borderColor: 'oklch(0.18 0.025 240)', flexShrink: 0 }}
      >
        <div className="panel-header mb-2">周期选择</div>
        <div className="flex flex-wrap gap-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              className={cn('tf-btn', selectedTimeframe === tf && 'active')}
              onClick={() => setSelectedTimeframe(market, tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator toggles */}
      <div
        className="px-3 py-2 border-t"
        style={{ borderColor: 'oklch(0.18 0.025 240)', flexShrink: 0 }}
      >
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setShowIndicators(!showIndicators)}
        >
          <span className="panel-header">指标开关</span>
          <ChevronDown
            size={11}
            style={{
              color: '#6b7fa3',
              transform: showIndicators ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </button>
        {showIndicators && (
          <div className="mt-2 flex flex-col gap-1.5">
            {[
              { key: 'macd', label: 'MACD (12,26,9)', color: '#0ea5e9' },
              { key: 'rsi', label: 'RSI (14)', color: '#a855f7' },
              { key: 'bollinger', label: '布林带 (20,2)', color: '#22d3ee' },
              { key: 'ma', label: '均线', color: '#f59e0b' },
              { key: 'volume', label: '成交量', color: '#6b7fa3' },
            ].map(ind => (
              <label key={ind.key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={Boolean(indicators[ind.key as keyof typeof indicators])}
                  onChange={() => toggleIndicator(ind.key)}
                  className="w-3 h-3 rounded"
                  style={{ accentColor: ind.color }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: indicators[ind.key as keyof typeof indicators] ? '#c8d4e8' : '#4a5a7a',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  {ind.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Signal toggles */}
      <div
        className="px-3 py-2 border-t"
        style={{ borderColor: 'oklch(0.18 0.025 240)', flexShrink: 0 }}
      >
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setShowSignals(!showSignals)}
        >
          <span className="panel-header">信号开关</span>
          <ChevronDown
            size={11}
            style={{
              color: '#6b7fa3',
              transform: showSignals ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </button>
        {showSignals && (
          <div className="mt-2 flex flex-col gap-1.5">
            {[
              { key: 'major', label: '重大信号', color: '#0ea5e9' },
              { key: 'thirdBuyCandidate', label: '三买候选', color: 'rgba(168,85,247,0.6)' },
              { key: 'thirdBuyConfirmed', label: '三买确认', color: '#a855f7' },
            ].map(sig => (
              <label key={sig.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={signalSettings[sig.key as keyof typeof signalSettings] as boolean}
                  onChange={() => toggleSignalType(sig.key)}
                  className="w-3 h-3 rounded"
                  style={{ accentColor: sig.color }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: signalSettings[sig.key as keyof typeof signalSettings] ? '#c8d4e8' : '#4a5a7a',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  {sig.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
