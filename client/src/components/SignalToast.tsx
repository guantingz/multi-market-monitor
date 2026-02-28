// ============================================================
// Multi-Market Live Monitor — Signal Toast Notifications
// Right-bottom corner toast for high-strength signals
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useMarketContext } from '@/contexts/MarketContext';
import { getSignalLabel, getSignalColor } from '@/lib/signalEngine';
import { toSGT } from '@/lib/mockDataEngine';
import { X, Zap } from 'lucide-react';

export default function SignalToast() {
  const { toastSignals, dismissToast } = useMarketContext();

  if (toastSignals.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 flex flex-col gap-2 z-50"
      style={{ maxWidth: 320 }}
    >
      {toastSignals.map(signal => {
        const color = getSignalColor(signal.type);
        return (
          <div
            key={signal.id}
            className="toast-enter rounded"
            style={{
              background: 'oklch(0.13 0.025 240)',
              border: `1px solid ${color}50`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${color}20`,
              padding: '10px 12px',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Zap size={14} style={{ color, marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color,
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}
                    >
                      {getSignalLabel(signal.type)}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#e8edf5',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600,
                      }}
                    >
                      {signal.symbol}
                    </span>
                    <span
                      className="px-1 py-0.5 rounded"
                      style={{ background: 'oklch(0.18 0.025 240)', color: '#6b7fa3', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {signal.timeframe}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: '#8a9fc0', marginTop: 2 }}>
                    {signal.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div style={{ flex: 1, height: 2, background: 'oklch(0.18 0.025 240)', borderRadius: 1 }}>
                      <div style={{ width: `${signal.strength}%`, height: '100%', background: color, borderRadius: 1 }} />
                    </div>
                    <span style={{ fontSize: 9, color, fontFamily: 'JetBrains Mono, monospace' }}>
                      强度 {signal.strength}
                    </span>
                    <span style={{ fontSize: 9, color: '#4a5a7a', fontFamily: 'JetBrains Mono, monospace' }}>
                      {toSGT(signal.time)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => dismissToast(signal.id)}
                className="shrink-0 mt-0.5"
                style={{ color: '#4a5a7a' }}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
