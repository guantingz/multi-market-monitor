// ============================================================
// Multi-Market Live Monitor — Signal Center Page
// Global view of all signals across all markets
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useState } from 'react';
import { useMarketContext } from '@/contexts/MarketContext';
import { getSignalLabel, getSignalColor } from '@/lib/signalEngine';
import { toSGT } from '@/lib/mockDataEngine';
import type { MarketType, Timeframe, SignalType } from '@/lib/types';
import { Bell, Filter, Trash2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

const MARKET_LABELS: Record<MarketType, string> = {
  fx: '外汇',
  cn: 'A股',
  hk: '港股',
  us: '美股',
  crypto: '数字货币',
  commodities: '大宗期货',
};

const MARKET_COLORS: Record<MarketType, string> = {
  fx: '#0ea5e9',
  cn: '#f59e0b',
  hk: '#22d3ee',
  us: '#a78bfa',
  crypto: '#fb923c',
  commodities: '#34d399',
};

export default function SignalCenter() {
  const { signals, signalSettings, muteSignalType, unmuteSignalType } = useMarketContext();
  const [filterMarket, setFilterMarket] = useState<MarketType | 'all'>('all');
  const [filterTf, setFilterTf] = useState<Timeframe | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'strength'>('time');

  const markets: (MarketType | 'all')[] = ['all', 'fx', 'cn', 'hk', 'us', 'crypto', 'commodities'];
  const timeframes: (Timeframe | 'all')[] = ['all', '1D', '4H', '1H', '15m', '5m'];

  // Get unique signal types
  const signalTypes = Array.from(new Set(signals.map(s => s.type)));

  // Filter
  const filtered = signals
    .filter(s => {
      if (filterMarket !== 'all' && s.market !== filterMarket) return false;
      if (filterTf !== 'all' && s.timeframe !== filterTf) return false;
      if (filterType !== 'all' && s.type !== filterType) return false;
      return true;
    })
    .sort((a, b) => sortBy === 'time' ? b.time - a.time : b.strength - a.strength);

  // Stats
  const stats = {
    total: signals.length,
    thirdBuy: signals.filter(s => s.type.startsWith('third_buy')).length,
    confirmed: signals.filter(s => s.type === 'third_buy_confirmed').length,
    highStrength: signals.filter(s => s.strength >= 70).length,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 48, background: 'oklch(0.09 0.022 240)', borderBottom: '1px solid oklch(0.20 0.025 240)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-3">
          <Bell size={16} style={{ color: '#0ea5e9' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0ea5e9', fontFamily: 'Space Grotesk, sans-serif' }}>
            信号中心
          </span>
          <span style={{ fontSize: 11, color: '#4a5a7a', fontFamily: 'Space Grotesk, sans-serif' }}>
            Signal Center
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 10, color: '#6b7fa3' }}>排序:</span>
          <button
            className={cn('tf-btn', sortBy === 'time' && 'active')}
            onClick={() => setSortBy('time')}
          >时间</button>
          <button
            className={cn('tf-btn', sortBy === 'strength' && 'active')}
            onClick={() => setSortBy('strength')}
          >强度</button>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center gap-6 px-4 py-2 border-b"
        style={{ borderColor: 'oklch(0.20 0.025 240)', background: 'oklch(0.10 0.022 240)', flexShrink: 0 }}
      >
        {[
          { label: '总信号', value: stats.total, color: '#e8edf5' },
          { label: '三买信号', value: stats.thirdBuy, color: '#a855f7' },
          { label: '三买确认', value: stats.confirmed, color: '#22c55e' },
          { label: '高强度(≥70)', value: stats.highStrength, color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2">
            <span style={{ fontSize: 10, color: '#6b7fa3' }}>{stat.label}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: stat.color, fontFamily: 'JetBrains Mono, monospace' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-4 px-4 py-2 border-b flex-wrap"
        style={{ borderColor: 'oklch(0.20 0.025 240)', background: 'oklch(0.09 0.022 240)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-1">
          <Filter size={10} style={{ color: '#6b7fa3' }} />
          <span style={{ fontSize: 10, color: '#6b7fa3' }}>市场:</span>
          {markets.map(m => (
            <button
              key={m}
              className={cn('tf-btn', filterMarket === m && 'active')}
              onClick={() => setFilterMarket(m)}
              style={{ padding: '2px 6px', fontSize: 10 }}
            >
              {m === 'all' ? '全部' : MARKET_LABELS[m]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 10, color: '#6b7fa3' }}>周期:</span>
          {timeframes.map(tf => (
            <button
              key={tf}
              className={cn('tf-btn', filterTf === tf && 'active')}
              onClick={() => setFilterTf(tf)}
              style={{ padding: '2px 6px', fontSize: 10 }}
            >
              {tf === 'all' ? '全部' : tf}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 10, color: '#6b7fa3' }}>类型:</span>
          <button
            className={cn('tf-btn', filterType === 'all' && 'active')}
            onClick={() => setFilterType('all')}
            style={{ padding: '2px 6px', fontSize: 10 }}
          >全部</button>
          {signalTypes.slice(0, 6).map(t => (
            <button
              key={t}
              className={cn('tf-btn', filterType === t && 'active')}
              onClick={() => setFilterType(t)}
              style={{ padding: '2px 6px', fontSize: 10, color: getSignalColor(t as SignalType) }}
            >
              {getSignalLabel(t as SignalType)}
            </button>
          ))}
        </div>
      </div>

      {/* Signal list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Bell size={32} style={{ color: 'oklch(0.25 0.02 240)' }} />
            <span style={{ fontSize: 13, color: 'oklch(0.40 0.01 230)' }}>暂无信号</span>
            <span style={{ fontSize: 11, color: 'oklch(0.35 0.01 230)' }}>切换到各市场页面后，信号将自动生成并汇总到此处</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'oklch(0.10 0.022 240)', position: 'sticky', top: 0, zIndex: 1 }}>
                {['时间 (SGT)', '市场', '品种', '周期', '信号类型', '价格', '强度', '描述', '操作'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '6px 12px',
                      textAlign: 'left',
                      fontSize: 10,
                      color: '#6b7fa3',
                      fontWeight: 600,
                      fontFamily: 'Space Grotesk, sans-serif',
                      borderBottom: '1px solid oklch(0.18 0.025 240)',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((signal, idx) => {
                const color = getSignalColor(signal.type);
                const isMuted = signalSettings.mutedTypes.has(signal.type);
                return (
                  <tr
                    key={signal.id}
                    style={{
                      background: idx % 2 === 0 ? 'transparent' : 'oklch(0.10 0.022 240 / 0.3)',
                      borderBottom: '1px solid oklch(0.14 0.02 240)',
                    }}
                  >
                    <td style={{ padding: '6px 12px', fontSize: 10, color: '#4a5a7a', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                      {toSGT(signal.time)}
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{ background: `${MARKET_COLORS[signal.market]}15`, color: MARKET_COLORS[signal.market], fontSize: 10, fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {MARKET_LABELS[signal.market]}
                      </span>
                    </td>
                    <td style={{ padding: '6px 12px', fontSize: 11, color: '#e8edf5', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                      {signal.symbol}
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <span
                        className="px-1 py-0.5 rounded"
                        style={{ background: 'oklch(0.16 0.025 240)', color: '#6b7fa3', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {signal.timeframe}
                      </span>
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{ background: `${color}15`, color, fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', border: `1px solid ${color}30` }}
                      >
                        {getSignalLabel(signal.type)}
                      </span>
                    </td>
                    <td style={{ padding: '6px 12px', fontSize: 11, color: '#c8d4e8', fontFamily: 'JetBrains Mono, monospace' }}>
                      {signal.price.toFixed(4)}
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <div className="flex items-center gap-1">
                        <div style={{ width: 36, height: 3, background: 'oklch(0.18 0.025 240)', borderRadius: 1 }}>
                          <div style={{ width: `${signal.strength}%`, height: '100%', background: color, borderRadius: 1 }} />
                        </div>
                        <span style={{ fontSize: 9, color, fontFamily: 'JetBrains Mono, monospace' }}>{signal.strength}</span>
                      </div>
                    </td>
                    <td style={{ padding: '6px 12px', fontSize: 10, color: '#8a9fc0', maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {signal.description}
                      </span>
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <button
                        onClick={() => isMuted ? unmuteSignalType(signal.type) : muteSignalType(signal.type)}
                        title={isMuted ? '取消静音' : '静音此类信号'}
                        style={{ color: isMuted ? '#ef4444' : '#6b7fa3' }}
                      >
                        {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
