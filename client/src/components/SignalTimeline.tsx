// ============================================================
// Multi-Market Live Monitor — Signal Timeline Component
// Shows signals for current symbol with filter support
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useState } from 'react';
import { useMarketContext } from '@/contexts/MarketContext';
import { getSignalLabel, getSignalColor } from '@/lib/signalEngine';
import { toSGT } from '@/lib/mockDataEngine';
import type { Signal, SignalFilter, MarketType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Filter, Zap } from 'lucide-react';

interface SignalTimelineProps {
  symbol?: string;
  market?: MarketType;
  maxItems?: number;
  showFilter?: boolean;
}

function StrengthBar({ strength }: { strength: number }) {
  const color = strength >= 70 ? '#22c55e' : strength >= 40 ? '#0ea5e9' : '#6b7fa3';
  return (
    <div className="flex items-center gap-1">
      <div style={{ width: 40, height: 3, background: 'oklch(0.18 0.025 240)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{ width: `${strength}%`, height: '100%', background: color, borderRadius: 1 }} />
      </div>
      <span style={{ fontSize: 9, color, fontFamily: 'JetBrains Mono, monospace', minWidth: 22 }}>
        {strength}
      </span>
    </div>
  );
}

const FILTER_OPTIONS: { value: SignalFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'third_buy', label: '三买' },
  { value: 'indicators', label: '指标' },
];

export default function SignalTimeline({ symbol, market, maxItems = 50, showFilter = true }: SignalTimelineProps) {
  const { signals, signalFilter, setSignalFilter } = useMarketContext();
  const [localFilter, setLocalFilter] = useState<SignalFilter>('all');

  const activeFilter = showFilter ? signalFilter : localFilter;
  const setActiveFilter = showFilter ? setSignalFilter : setLocalFilter;

  // Filter signals
  const filtered = signals
    .filter(s => {
      if (symbol && s.symbol !== symbol) return false;
      if (market && s.market !== market) return false;
      if (activeFilter === 'third_buy') return s.type.startsWith('third_buy');
      if (activeFilter === 'indicators') return !s.type.startsWith('third_buy');
      return true;
    })
    .slice(0, maxItems);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'oklch(0.18 0.025 240)' }}>
        <div className="flex items-center gap-2">
          <Zap size={12} style={{ color: '#0ea5e9' }} />
          <span className="panel-header">信号时间线</span>
          {filtered.length > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {filtered.length}
            </span>
          )}
        </div>
        {showFilter && (
          <div className="flex items-center gap-1">
            <Filter size={10} style={{ color: '#6b7fa3' }} />
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={cn('tf-btn', activeFilter === opt.value && 'active')}
                style={{ padding: '2px 6px', fontSize: 10 }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Signal list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-2">
            <Zap size={20} style={{ color: 'oklch(0.30 0.02 240)' }} />
            <span style={{ fontSize: 11, color: 'oklch(0.40 0.01 230)' }}>暂无信号</span>
          </div>
        ) : (
          filtered.map(signal => (
            <SignalItem key={signal.id} signal={signal} showSymbol={!symbol} />
          ))
        )}
      </div>
    </div>
  );
}

function SignalItem({ signal, showSymbol }: { signal: Signal; showSymbol: boolean }) {
  const color = getSignalColor(signal.type);
  const isThirdBuy = signal.type.startsWith('third_buy');

  return (
    <div className="signal-item">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Type badge + symbol */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-1.5 py-0.5 rounded text-xs font-medium"
              style={{
                background: `${color}20`,
                color,
                fontSize: 10,
                fontFamily: 'Space Grotesk, sans-serif',
                border: `1px solid ${color}40`,
              }}
            >
              {getSignalLabel(signal.type)}
            </span>
            {showSymbol && (
              <span style={{ fontSize: 11, color: '#c8d4e8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {signal.symbol}
              </span>
            )}
            <span
              className="px-1 py-0.5 rounded"
              style={{ background: 'oklch(0.16 0.025 240)', color: '#6b7fa3', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {signal.timeframe}
            </span>
          </div>

          {/* Description */}
          <div style={{ fontSize: 10, color: '#8a9fc0', marginTop: 2, lineHeight: 1.4 }}>
            {signal.description}
          </div>

          {/* Key levels for third buy */}
          {isThirdBuy && signal.keyLevels && (
            <div className="flex items-center gap-3 mt-1">
              {signal.keyLevels.zhongshuHigh && (
                <span style={{ fontSize: 9, color: '#6b7fa3' }}>
                  中枢上沿: <span style={{ color: '#a855f7', fontFamily: 'JetBrains Mono, monospace' }}>
                    {signal.keyLevels.zhongshuHigh.toFixed(4)}
                  </span>
                </span>
              )}
              {signal.keyLevels.pullbackLow && (
                <span style={{ fontSize: 9, color: '#6b7fa3' }}>
                  回抽低点: <span style={{ color: '#22c55e', fontFamily: 'JetBrains Mono, monospace' }}>
                    {signal.keyLevels.pullbackLow.toFixed(4)}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: time + strength */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span style={{ fontSize: 9, color: '#4a5a7a', fontFamily: 'JetBrains Mono, monospace' }}>
            {toSGT(signal.time)}
          </span>
          <StrengthBar strength={signal.strength} />
        </div>
      </div>
    </div>
  );
}
