// ============================================================
// Multi-Market Live Monitor — Quote Card Component
// Shows OHLC snapshot for selected symbol
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { getRealQuote } from '@/lib/realDataAdapter';
import { formatPrice, formatChangePct, toSGT } from '@/lib/mockDataEngine';
import type { MarketType, QuoteSnapshot } from '@/lib/types';
import { TrendingUp, TrendingDown, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuoteCardProps {
  symbol: string;
  market: MarketType;
}

export default function QuoteCard({ symbol, market }: QuoteCardProps) {
  const [quote, setQuote] = useState<QuoteSnapshot | null>(null);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef<number | null>(null);
  useEffect(() => {
    let mounted = true;
    setQuote(null);

    const fetchQuote = async () => {
      try {
        const q = await getRealQuote(symbol, market);
        if (!mounted) return;
        if (prevPrice.current !== null && prevPrice.current !== q.price) {
          const dir = q.price > prevPrice.current ? 'up' : 'down';
          setFlash(dir);
          setTimeout(() => setFlash(null), 600);
        }
        prevPrice.current = q.price;
        setQuote(q);
      } catch (e) {
        console.warn('[QuoteCard] fetch error:', e);
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, [symbol, market]);

  if (!quote) {
    return (
      <div className="quote-card animate-pulse" style={{ minHeight: 90 }}>
        <div className="h-4 rounded w-24 mb-2" style={{ background: 'oklch(0.18 0.025 240)' }} />
        <div className="h-8 rounded w-40 mb-2" style={{ background: 'oklch(0.18 0.025 240)' }} />
        <div className="h-3 rounded w-32" style={{ background: 'oklch(0.18 0.025 240)' }} />
      </div>
    );
  }

  const isUp = quote.changePct >= 0;
  const priceColor = isUp ? '#22c55e' : '#ef4444';

  return (
    <div
      className={cn('quote-card transition-all', flash === 'up' && 'flash-green', flash === 'down' && 'flash-red')}
    >
      <div className="flex items-start gap-4">
        {/* Left: Symbol + price */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5', fontFamily: 'JetBrains Mono, monospace' }}>
              {quote.symbol}
            </span>
            <span style={{ fontSize: 10, color: '#4a5a7a', fontFamily: 'Space Grotesk, sans-serif' }}>
              {quote.name}
            </span>
            {quote.isDelayed && (
              <span
                className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontSize: 9, border: '1px solid rgba(245,158,11,0.3)' }}
              >
                <AlertCircle size={8} />
                延迟{quote.delayMinutes}m
              </span>
            )}
          </div>

          <div className="flex items-end gap-3">
            <span style={{ fontSize: 26, fontWeight: 700, color: priceColor, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
              {formatPrice(quote.price, quote.symbol)}
            </span>
            <div className="flex items-center gap-1.5 mb-0.5">
              {isUp ? <TrendingUp size={13} color="#22c55e" /> : <TrendingDown size={13} color="#ef4444" />}
              <span style={{ fontSize: 12, color: priceColor, fontFamily: 'JetBrains Mono, monospace' }}>
                {isUp ? '+' : ''}{formatPrice(quote.change, quote.symbol)}
              </span>
              <span style={{ fontSize: 12, color: priceColor, fontFamily: 'JetBrains Mono, monospace' }}>
                ({formatChangePct(quote.changePct)})
              </span>
            </div>
          </div>
        </div>

        {/* Right: OHLC grid */}
        <div className="grid grid-cols-4 gap-x-4 gap-y-1 shrink-0">
          {[
            { label: '开盘', value: quote.open, color: '#c8d4e8' },
            { label: '最高', value: quote.high, color: '#22c55e' },
            { label: '最低', value: quote.low, color: '#ef4444' },
            { label: '昨收', value: quote.prevClose, color: '#8a9fc0' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 9, color: '#4a5a7a', fontFamily: 'Space Grotesk, sans-serif' }}>{item.label}</div>
              <div style={{ fontSize: 11, color: item.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {item.value ? formatPrice(item.value, quote.symbol) : '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Extra info */}
        <div className="flex flex-col gap-1 shrink-0">
          {quote.spread && (
            <div>
              <div style={{ fontSize: 9, color: '#4a5a7a' }}>点差</div>
              <div style={{ fontSize: 11, color: '#8a9fc0', fontFamily: 'JetBrains Mono, monospace' }}>
                {(quote.spread * 10000).toFixed(1)} pips
              </div>
            </div>
          )}
          {quote.volume && (
            <div>
              <div style={{ fontSize: 9, color: '#4a5a7a' }}>成交量</div>
              <div style={{ fontSize: 11, color: '#8a9fc0', fontFamily: 'JetBrains Mono, monospace' }}>
                {quote.volume > 1e6 ? `${(quote.volume / 1e6).toFixed(1)}M` : `${(quote.volume / 1e3).toFixed(0)}K`}
              </div>
            </div>
          )}
          <div className="flex items-center gap-1 mt-auto">
            <RefreshCw size={8} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: 9, color: '#3a4a6a', fontFamily: 'JetBrains Mono, monospace' }}>
              {toSGT(quote.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
