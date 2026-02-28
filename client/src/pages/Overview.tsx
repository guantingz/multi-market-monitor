// ============================================================
// Multi-Market Live Monitor — Overview Dashboard
// Shows all 6 markets at a glance with mini-charts
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useEffect, useState } from 'react';
import { MARKET_SYMBOLS, getAdapter, formatPrice, formatChangePct } from '@/lib/mockDataEngine';
import type { MarketType, QuoteSnapshot } from '@/lib/types';
import { useMarketContext } from '@/contexts/MarketContext';
import { TrendingUp, TrendingDown, Activity, Bell, Globe } from 'lucide-react';

const MARKET_INFO: { market: MarketType; label: string; en: string; color: string }[] = [
  { market: 'fx', label: '外汇', en: 'FX', color: '#0ea5e9' },
  { market: 'cn', label: 'A股', en: 'CN', color: '#f59e0b' },
  { market: 'hk', label: '港股', en: 'HK', color: '#22d3ee' },
  { market: 'us', label: '美股', en: 'US', color: '#a78bfa' },
  { market: 'crypto', label: '数字货币', en: 'Crypto', color: '#fb923c' },
  { market: 'commodities', label: '大宗期货', en: 'Commodities', color: '#34d399' },
];

interface MarketQuotes {
  [symbol: string]: QuoteSnapshot;
}

function MiniQuoteRow({ symbol, market }: { symbol: string; market: MarketType }) {
  const [quote, setQuote] = useState<QuoteSnapshot | null>(null);
  const adapter = getAdapter(market);

  useEffect(() => {
    let mounted = true;
    adapter.getQuote(symbol).then(q => { if (mounted) setQuote(q); });
    const unsub = adapter.subscribeQuote(symbol, q => { if (mounted) setQuote(q); });
    return () => { mounted = false; unsub(); };
  }, [symbol, market]);

  if (!quote) return (
    <div className="flex items-center justify-between py-1 animate-pulse">
      <div style={{ width: 60, height: 10, background: 'oklch(0.18 0.025 240)', borderRadius: 2 }} />
      <div style={{ width: 50, height: 10, background: 'oklch(0.18 0.025 240)', borderRadius: 2 }} />
    </div>
  );

  const isUp = quote.changePct >= 0;
  return (
    <div className="flex items-center justify-between py-1">
      <span style={{ fontSize: 11, color: '#8a9fc0', fontFamily: 'JetBrains Mono, monospace' }}>
        {symbol}
      </span>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 11, color: isUp ? '#22c55e' : '#ef4444', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
          {formatPrice(quote.price, symbol)}
        </span>
        <span style={{ fontSize: 10, color: isUp ? '#22c55e' : '#ef4444', fontFamily: 'JetBrains Mono, monospace', minWidth: 52, textAlign: 'right' }}>
          {formatChangePct(quote.changePct)}
        </span>
      </div>
    </div>
  );
}

function MarketCard({ market, label, en, color }: { market: MarketType; label: string; en: string; color: string }) {
  const { setCurrentMarket } = useMarketContext();
  const symbols = MARKET_SYMBOLS[market].slice(0, 4);

  return (
    <div
      className="rounded cursor-pointer transition-all"
      style={{
        background: 'oklch(0.11 0.025 240)',
        border: `1px solid oklch(0.18 0.025 240)`,
        padding: '12px 14px',
      }}
      onClick={() => setCurrentMarket(market)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div style={{ width: 3, height: 16, background: color, borderRadius: 2 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'Space Grotesk, sans-serif' }}>
            {label}
          </span>
          <span style={{ fontSize: 10, color: '#4a5a7a', fontFamily: 'Space Grotesk, sans-serif' }}>
            {en}
          </span>
        </div>
        <span
          className="px-1.5 py-0.5 rounded text-xs"
          style={{ background: `${color}15`, color, fontSize: 9, fontFamily: 'Space Grotesk, sans-serif' }}
        >
          查看详情 →
        </span>
      </div>

      {/* Symbol rows */}
      <div className="divide-y" style={{ borderColor: 'oklch(0.16 0.02 240)' }}>
        {symbols.map(s => (
          <MiniQuoteRow key={s.symbol} symbol={s.symbol} market={market} />
        ))}
      </div>
    </div>
  );
}

export default function Overview() {
  const { signals } = useMarketContext();
  const recentSignals = signals.slice(0, 8);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 44, background: 'oklch(0.09 0.022 240)', borderBottom: '1px solid oklch(0.20 0.025 240)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-3">
          <Globe size={16} style={{ color: '#0ea5e9' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5', fontFamily: 'Space Grotesk, sans-serif' }}>
            全市场概览
          </span>
          <span style={{ fontSize: 10, color: '#4a5a7a' }}>Multi-Market Overview</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={12} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: 10, color: '#22c55e', fontFamily: 'Space Grotesk, sans-serif' }}>实时模拟</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Market grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {MARKET_INFO.map(m => (
            <MarketCard key={m.market} {...m} />
          ))}
        </div>

        {/* Recent signals */}
        {recentSignals.length > 0 && (
          <div
            className="rounded"
            style={{ background: 'oklch(0.11 0.025 240)', border: '1px solid oklch(0.18 0.025 240)', padding: '12px 14px' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Bell size={12} style={{ color: '#0ea5e9' }} />
              <span className="panel-header">最新信号</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {recentSignals.map(s => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 py-1"
                  style={{ borderBottom: '1px solid oklch(0.14 0.02 240)' }}
                >
                  <span style={{ fontSize: 10, color: '#c8d4e8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {s.symbol}
                  </span>
                  <span style={{ fontSize: 9, color: '#6b7fa3' }}>{s.timeframe}</span>
                  <span style={{ fontSize: 10, color: '#8a9fc0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
