// ============================================================
// Multi-Market Live Monitor — Watchlist Component
// Shows symbol list with live quotes for a given market
// Supports: dynamic add (dropdown) + delete per symbol
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { useMarketContext } from '@/contexts/MarketContext';
import { formatPrice, formatChangePct } from '@/lib/mockDataEngine';
import { ALL_MARKET_SYMBOLS, DEFAULT_SYMBOLS } from '@/lib/allSymbols';
import { getRealQuotesBatch } from '@/lib/realDataAdapter';
import type { MarketType, QuoteSnapshot, Timeframe } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Plus, X, Search } from 'lucide-react';

// ── localStorage persistence helpers ──
const LS_KEY = 'mmm_watchlist_v1';

function loadPersistedSymbols(): Partial<Record<MarketType, string[]>> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Partial<Record<MarketType, string[]>>;
  } catch { /* ignore */ }
  return {};
}

function persistSymbols(market: MarketType, symbols: string[]): void {
  try {
    const current = loadPersistedSymbols();
    current[market] = symbols;
    localStorage.setItem(LS_KEY, JSON.stringify(current));
  } catch { /* ignore */ }
}

function getInitialSymbols(market: MarketType): string[] {
  const persisted = loadPersistedSymbols();
  return persisted[market] ?? DEFAULT_SYMBOLS[market];
}

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

  // Active symbols list — initialised from localStorage, falls back to defaults
  const [activeSymbols, setActiveSymbols] = useState<string[]>(
    () => getInitialSymbols(market)
  );

  const [quotes, setQuotes] = useState<Record<string, QuoteSnapshot>>({});
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});
  const prevPrices = useRef<Record<string, number>>({});
  const [showIndicators, setShowIndicators] = useState(false);
  const [showSignals, setShowSignals] = useState(true);

  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allSymbols = ALL_MARKET_SYMBOLS[market];

  // Available symbols = all symbols NOT already in the active list
  const availableSymbols = allSymbols.filter(
    s => !activeSymbols.includes(s.symbol)
  );

  const filteredAvailable = availableSymbols.filter(s =>
    s.symbol.toLowerCase().includes(searchText.toLowerCase()) ||
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // When market changes, load that market's persisted list (or defaults)
  useEffect(() => {
    setActiveSymbols(getInitialSymbols(market));
    setShowDropdown(false);
    setSearchText('');
  }, [market]);

  // Fetch quotes for all active symbols
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const items = activeSymbols.map(sym => ({ symbol: sym, market }));
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
  }, [market, activeSymbols]);

  const handleAddSymbol = useCallback((symbol: string) => {
    setActiveSymbols(prev => {
      const next = [...prev, symbol];
      persistSymbols(market, next);
      return next;
    });
    setShowDropdown(false);
    setSearchText('');
  }, [market]);

  const handleDeleteSymbol = useCallback((symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSymbols(prev => {
      const next = prev.filter(s => s !== symbol);
      // If deleted symbol was selected, auto-select first remaining
      if (selectedSymbol === symbol && next.length > 0) {
        setSelectedSymbol(market, next[0]);
      }
      persistSymbols(market, next);
      return next;
    });
  }, [selectedSymbol, market, setSelectedSymbol]);

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

      {/* Add Symbol Dropdown */}
      <div
        className="px-2 py-2 border-b"
        style={{ borderColor: 'oklch(0.18 0.025 240)', flexShrink: 0, position: 'relative' }}
        ref={dropdownRef}
      >
        <button
          onClick={() => setShowDropdown(v => !v)}
          className="flex items-center justify-between w-full px-2 py-1.5 rounded"
          style={{
            background: showDropdown ? 'oklch(0.18 0.030 240)' : 'oklch(0.14 0.025 240)',
            border: '1px solid oklch(0.22 0.028 240)',
            color: '#8a9fc0',
            fontSize: 11,
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <span className="flex items-center gap-1.5">
            <Plus size={11} style={{ color: '#0ea5e9' }} />
            添加品种
          </span>
          <ChevronDown
            size={10}
            style={{
              color: '#6b7fa3',
              transform: showDropdown ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </button>

        {showDropdown && (
          <div
            className="absolute left-2 right-2 z-50 rounded"
            style={{
              top: '100%',
              marginTop: 2,
              background: 'oklch(0.13 0.025 240)',
              border: '1px solid oklch(0.24 0.030 240)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              maxHeight: 220,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-1.5 px-2 py-1.5"
              style={{ borderBottom: '1px solid oklch(0.20 0.025 240)', flexShrink: 0 }}
            >
              <Search size={10} style={{ color: '#6b7fa3', flexShrink: 0 }} />
              <input
                autoFocus
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="搜索品种..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#c8d4e8',
                  fontSize: 11,
                  fontFamily: 'Space Grotesk, sans-serif',
                  width: '100%',
                }}
              />
            </div>

            {/* Symbol list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredAvailable.length === 0 ? (
                <div
                  className="px-3 py-3 text-center"
                  style={{ fontSize: 10, color: '#4a5a7a', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {searchText ? '无匹配品种' : '所有品种已添加'}
                </div>
              ) : (
                filteredAvailable.map(s => (
                  <button
                    key={s.symbol}
                    onClick={() => handleAddSymbol(s.symbol)}
                    className="flex items-center justify-between w-full px-3 py-1.5"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.18 0.030 240)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: '#0ea5e9',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600,
                      }}
                    >
                      {s.symbol}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: '#4a5a7a',
                        fontFamily: 'Space Grotesk, sans-serif',
                        maxWidth: 90,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Symbol list */}
      <div className="flex-1 overflow-y-auto">
        {activeSymbols.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-2"
            style={{ color: '#4a5a7a', fontSize: 11, fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <Plus size={20} style={{ color: '#2a3a5a' }} />
            <span>点击上方添加品种</span>
          </div>
        ) : (
          activeSymbols.map(sym => {
            const s = ALL_MARKET_SYMBOLS[market].find(x => x.symbol === sym) ?? {
              symbol: sym, name: sym, basePrice: 0, volatility: 0, market,
            };
            const q = quotes[sym];
            const isSelected = selectedSymbol === sym;
            const flash = flashMap[sym];
            const isUp = q ? q.changePct >= 0 : true;

            return (
              <div
                key={sym}
                className={cn(
                  'watchlist-row',
                  isSelected && 'active',
                  flash === 'up' && 'flash-green',
                  flash === 'down' && 'flash-red'
                )}
                onClick={() => setSelectedSymbol(market, sym)}
                style={{ position: 'relative' }}
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
                      {sym}
                    </span>
                    <div className="flex items-center gap-1">
                      {q ? (
                        <span
                          style={{
                            fontSize: 11,
                            color: isUp ? '#22c55e' : '#ef4444',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: 600,
                          }}
                        >
                          {formatPrice(q.price, sym)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, color: '#4a5a7a' }}>—</span>
                      )}
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteSymbol(sym, e)}
                        title={`移除 ${sym}`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '1px 2px',
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0.4,
                          transition: 'opacity 0.15s, background 0.15s',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.opacity = '0.4';
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        }}
                      >
                        <X size={9} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
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
                        H:{formatPrice(q.high ?? q.price * 1.005, sym)}
                      </span>
                      <span style={{ fontSize: 9, color: '#3a4a6a', fontFamily: 'JetBrains Mono, monospace' }}>
                        L:{formatPrice(q.low ?? q.price * 0.995, sym)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
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
