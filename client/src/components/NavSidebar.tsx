// ============================================================
// Multi-Market Live Monitor — Navigation Sidebar
// Left icon-only navigation for market switching
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useMarketContext } from '@/contexts/MarketContext';
import type { MarketType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Bell, Activity } from 'lucide-react';

interface NavItem {
  market: MarketType;
  label: string;
  abbr: string;
  color: string;
  bgColor: string;
}

const NAV_ITEMS: NavItem[] = [
  { market: 'fx', label: '外汇 FX', abbr: 'FX', color: '#0ea5e9', bgColor: 'rgba(14,165,233,0.12)' },
  { market: 'cn', label: 'A股 CN', abbr: 'A股', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.12)' },
  { market: 'hk', label: '港股 HK', abbr: 'HK', color: '#22d3ee', bgColor: 'rgba(34,211,238,0.12)' },
  { market: 'us', label: '美股 US', abbr: 'US', color: '#a78bfa', bgColor: 'rgba(167,139,250,0.12)' },
  { market: 'crypto', label: '数字货币', abbr: '₿', color: '#fb923c', bgColor: 'rgba(251,146,60,0.12)' },
  { market: 'commodities', label: '大宗期货', abbr: '期货', color: '#34d399', bgColor: 'rgba(52,211,153,0.12)' },
];

interface NavSidebarProps {
  onSignalCenter: () => void;
  onMarketChange?: (m: MarketType) => void;
  signalCenterActive: boolean;
  unreadCount: number;
}

export default function NavSidebar({ onSignalCenter, onMarketChange, signalCenterActive, unreadCount }: NavSidebarProps) {
  const { currentMarket, setCurrentMarket } = useMarketContext();
  const handleMarket = onMarketChange ?? setCurrentMarket;

  return (
    <nav
      className="flex flex-col items-center py-3 gap-1.5"
      style={{
        width: 56,
        minWidth: 56,
        background: 'oklch(0.08 0.022 240)',
        borderRight: '1px solid oklch(0.18 0.025 240)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="mb-2 flex flex-col items-center">
        <div
          className="w-9 h-9 rounded flex items-center justify-center font-bold"
          style={{
            background: 'linear-gradient(135deg, oklch(0.62 0.2 220), oklch(0.55 0.18 270))',
            color: '#fff',
            fontSize: 10,
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '0.02em',
            boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
          }}
        >
          MM
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 border-b mb-1" style={{ borderColor: 'oklch(0.18 0.025 240)' }} />

      {/* Market nav items */}
      {NAV_ITEMS.map(item => {
        const isActive = currentMarket === item.market && !signalCenterActive;
        return (
          <button
            key={item.market}
            onClick={() => handleMarket(item.market)}
            title={item.label}
            className="w-10 h-10 rounded flex flex-col items-center justify-center gap-0.5 transition-all relative"
            style={{
              background: isActive ? item.bgColor : 'transparent',
              borderLeft: isActive ? `2px solid ${item.color}` : '2px solid transparent',
            }}
          >
            {isActive && (
              <div
                className="absolute inset-0 rounded"
                style={{ boxShadow: `inset 0 0 8px ${item.color}20` }}
              />
            )}
            <span
              className="font-bold leading-none relative z-10"
              style={{
                fontSize: item.abbr.length > 2 ? 8 : 10,
                color: isActive ? item.color : 'oklch(0.45 0.02 230)',
                fontFamily: 'Space Grotesk, sans-serif',
                letterSpacing: '-0.02em',
                transition: 'color 0.15s',
              }}
            >
              {item.abbr}
            </span>
          </button>
        );
      })}

      <div className="flex-1" />

      {/* Activity indicator */}
      <div className="flex flex-col items-center gap-0.5 mb-2">
        <Activity size={10} style={{ color: 'oklch(0.35 0.02 240)' }} />
        <span style={{ fontSize: 7, color: 'oklch(0.35 0.02 240)', fontFamily: 'JetBrains Mono, monospace' }}>
          LIVE
        </span>
      </div>

      {/* Divider */}
      <div className="w-8 border-b mb-1" style={{ borderColor: 'oklch(0.18 0.025 240)' }} />

      {/* Signal Center button */}
      <button
        onClick={onSignalCenter}
        title="信号中心 Signal Center"
        className="w-10 h-10 rounded flex items-center justify-center relative transition-all"
        style={{
          background: signalCenterActive ? 'rgba(14,165,233,0.12)' : 'transparent',
          borderLeft: signalCenterActive ? '2px solid #0ea5e9' : '2px solid transparent',
        }}
      >
        <Bell
          size={15}
          style={{ color: signalCenterActive ? '#0ea5e9' : 'oklch(0.45 0.02 230)' }}
        />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-0.5 rounded-full flex items-center justify-center"
            style={{
              width: 14,
              height: 14,
              background: '#ef4444',
              color: '#fff',
              fontSize: 7,
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              boxShadow: '0 0 6px rgba(239,68,68,0.6)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div className="mb-1" />
    </nav>
  );
}
