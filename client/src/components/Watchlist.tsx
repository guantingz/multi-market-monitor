// ============================================================
// client/src/components/Watchlist.tsx
// Optimized: Supports Universal A-Share Search (6-digit codes)
// ============================================================

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useMarketContext } from '@/contexts/MarketContext';
import { formatPrice } from '@/lib/mockDataEngine';
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

  const [activeSymbols, setActiveSymbols] = useState<string[]>(
    () => getInitialSymbols(market)
  );

  const [quotes, setQuotes] = useState<Record<string, QuoteSnapshot>>({});
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});
  const prevPrices = useRef<Record<string, number>>({});
  const [showIndicators, setShowIndicators] = useState(false);
  const [showSignals, setShowSignals] = useState(true);

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allSymbols = ALL_MARKET_SYMBOLS[market] || [];
  const availableSymbols = allSymbols.filter(s => !activeSymbols.includes(s.symbol));

  // ── 核心逻辑修改：动态识别 6 位 A 股代码 ──
  const filteredAvailable = useMemo(() => {
    let results = availableSymbols.filter(s =>
      s.symbol.toLowerCase().includes(searchText.toLowerCase()) ||
      s.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // 智能识别：如果是 6 位纯数字且不在当前列表中
    if (/^\d{6}$/.test(searchText)) {
      const alreadyInResults = results.some(r => r.symbol === searchText);
      const alreadyInWatchlist = activeSymbols.includes(searchText);

      if (!alreadyInResults && !alreadyInWatchlist) {
        results = [{
          symbol: searchText,
          name: `实时查询: ${searchText}`,
          market: 'cn',
          basePrice: 0,
          volatility: 0,
        } as any, ...results];
      }
    }
    return results;
  }, [searchText, availableSymbols, activeSymbols]);

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
    // 添加后自动选中该品种
    setSelectedSymbol(market, symbol);
    setShowDropdown(false);
    setSearchText('');
  }, [market, setSelectedSymbol]);

  const handleDeleteSymbol = useCallback((symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSymbols(prev => {
      const next = prev.filter(s => s !== symbol);
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
      <div className="px-3 py-2 border-b" style={{ borderColor: 'oklch(0.18 0.025 240)', flexShrink: 0 }}>
        <span className="panel-header">品种列表</span>
      </div>

      <div className="px-2 py-2 border-b" style={{ borderColor: 'oklch(0.18 0.025 240)', flexShrink: 0, position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(v => !v)}
          className="flex items-center justify-between w-full px-2 py-1.5 rounded"
          style={{
            background: showDropdown ? 'oklch(0.18 0.030 240)' : 'oklch(0.14 0.025 240)',
            border: '1px solid oklch(0.22 0.028 240)',
            color: '#8a9fc0', fontSize: 11, fontFamily: 'Space Grotesk, sans-serif', cursor: 'pointer',
          }}
        >
          <span className="flex items-center gap-1.5">
            <Plus size={11} style={{ color: '#0ea5e9' }} /> 添加品种
          </span>
          <ChevronDown size={10} style={{ color: '#6b7fa3', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {showDropdown && (
          <div className="absolute left-0 right-0 z-50 rounded shadow-2xl" style={{ top: '100%', marginTop: 4, background: 'oklch(0.13 0.025 240)', border: '1px solid oklch(0.24 0.030 240)', maxHeight: 300, display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-1.5 px-2 py-2 border-b" style={{ borderColor: 'oklch(0.20 0.025 240)' }}>
              <Search size={12} style={{ color: '#6b7fa3' }} />
              <input
                autoFocus
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="输入代码 (如 600519)..."
                className="w-full bg-transparent border-none outline-none text-blue-100 text-[11px]"
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredAvailable.length === 0 ? (
                <div className="px-3 py-4 text-center text-[10px] text-slate-500">
                  {searchText ? '未找到相关品种' : '所有品种已在自选'}
                </div>
              ) : (
                filteredAvailable.map(s => (
                  <button
                    key={s.symbol}
                    onClick={() => handleAddSymbol(s.symbol)}
                    className="flex items-center justify-between w-full px-3 py-2 hover:bg-slate-800 transition-colors text-left"
                  >
                    <span className="text-[11px] text-sky-400 font-mono font-semibold">{s.symbol}</span>
                    <span className="text-[9px] text-slate-400 truncate max-w-[100px]">{s.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSymbols.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600 text-[11px]">
            <Plus size={20} className="text-slate-800" />
            <span>添加品种开始监控</span>
          </div>
        ) : (
          activeSymbols.map(sym => {
            const s = allSymbols.find(x => x.symbol === sym) ?? {
              symbol: sym,
              name: sym, // 初始显示代码
              market,
            };
            const q = quotes[sym];
            const isSelected = selectedSymbol === sym;
            const flash = flashMap[sym];
            const isUp = q ? q.changePct >= 0 : true;

            return (
              <div
                key={sym}
                className={cn('watchlist-row', isSelected && 'active', flash === 'up' && 'flash-green', flash === 'down' && 'flash-red')}
                onClick={() => setSelectedSymbol(market, sym)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={cn("text-[11px] font-mono font-bold tracking-tighter", isSelected ? 'text-slate-100' : 'text-slate-400')}>
                      {sym}
                    </span>
                    <div className="flex items-center gap-1">
                      {q ? (
                        <span className={cn("text-[11px] font-mono font-bold", isUp ? 'text-green-500' : 'text-red-500')}>
                          {formatPrice(q.price, sym)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-700">加载中</span>
                      )}
                      <button
                        onClick={(e) => handleDeleteSymbol(sym, e)}
                        className="p-0.5 rounded opacity-20 hover:opacity-100 hover:bg-red-500/20 transition-all"
                      >
                        <X size={10} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-slate-500 truncate pr-2">
                      {q?.name || s.name}
                    </span>
                    {q && (
                      <span className={cn("flex items-center text-[10px] font-mono", isUp ? 'text-green-500' : 'text-red-500')}>
                        {isUp ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        {Math.abs(q.changePct).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Timeframe selector */}
      <div className="px-3 py-2 border-t" style={{ borderColor: 'oklch(0.18 0.025 240)', flexShrink: 0 }}>
        <div className="panel-header mb-2">时间周期</div>
        <div className="flex flex-wrap gap-1">
          {TIMEFRAMES.map(tf => (
            <button key={tf} className={cn('tf-btn', selectedTimeframe === tf && 'active')} onClick={() => setSelectedTimeframe(market, tf)}>
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
