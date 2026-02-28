// ============================================================
// Multi-Market Live Monitor — Chanlun Overlay Panel
// Shows Zhongshu rectangles and Third Buy signals as a panel
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import { useEffect, useState } from 'react';
import { getRealKlines } from '@/lib/realDataAdapter';
import { runChanlun } from '@/lib/chanlunEngine';
import type { MarketType, Timeframe } from '@/lib/types';
import type { ChanlunResult } from '@/lib/chanlunEngine';
import { toSGT } from '@/lib/mockDataEngine';
import { Activity } from 'lucide-react';

interface ChanlunOverlayProps {
  symbol: string;
  market: MarketType;
  timeframe: Timeframe;
}

export default function ChanlunOverlay({ symbol, market, timeframe }: ChanlunOverlayProps) {
  const [result, setResult] = useState<ChanlunResult | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const bars = await getRealKlines(symbol, market, timeframe, 200);
      if (!mounted) return;
      const r = runChanlun(bars, market, symbol, timeframe);
      setResult(r);
    };

    load();
    const interval = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [symbol, market, timeframe]);

  if (!result) return null;

  const { zhongshus, thirdBuys, bis } = result;
  const recentZhongshus = zhongshus.slice(-3);
  const recentBuys = thirdBuys.slice(-5);

  return (
    <div
      className="rounded"
      style={{ background: 'oklch(0.10 0.022 240)', border: '1px solid oklch(0.18 0.025 240)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'oklch(0.18 0.025 240)' }}>
        <Activity size={12} style={{ color: '#a855f7' }} />
        <span className="panel-header">缠论结构</span>
        <span style={{ fontSize: 9, color: '#6b7fa3' }}>笔级中枢 · {timeframe}</span>
      </div>

      <div className="px-3 py-2">
        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3">
          <div>
            <div style={{ fontSize: 9, color: '#6b7fa3' }}>识别笔数</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', fontFamily: 'JetBrains Mono, monospace' }}>
              {bis.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#6b7fa3' }}>中枢数量</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#a855f7', fontFamily: 'JetBrains Mono, monospace' }}>
              {zhongshus.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#6b7fa3' }}>三买信号</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', fontFamily: 'JetBrains Mono, monospace' }}>
              {thirdBuys.length}
            </div>
          </div>
        </div>

        {/* Recent Zhongshu */}
        {recentZhongshus.length > 0 && (
          <div className="mb-3">
            <div style={{ fontSize: 10, color: '#6b7fa3', marginBottom: 4 }}>近期中枢</div>
            {recentZhongshus.map((z, i) => (
              <div
                key={z.id}
                className="flex items-center justify-between py-1.5 px-2 rounded mb-1"
                style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
              >
                <div>
                  <div style={{ fontSize: 9, color: '#a855f7' }}>中枢 #{z.id + 1}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{ fontSize: 10, color: '#22c55e', fontFamily: 'JetBrains Mono, monospace' }}>
                      上沿: {z.high.toFixed(4)}
                    </span>
                    <span style={{ fontSize: 10, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
                      下沿: {z.low.toFixed(4)}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: '#4a5a7a', textAlign: 'right' }}>
                  <div>{toSGT(z.startTime * 1000)}</div>
                  <div>→ {toSGT(z.endTime * 1000)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Third Buy signals */}
        {recentBuys.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#6b7fa3', marginBottom: 4 }}>三买信号</div>
            {recentBuys.map(tb => (
              <div
                key={tb.id}
                className="flex items-center justify-between py-1.5 px-2 rounded mb-1"
                style={{
                  background: tb.status === 'confirmed' ? 'rgba(34,197,94,0.08)' : 'rgba(168,85,247,0.06)',
                  border: `1px solid ${tb.status === 'confirmed' ? 'rgba(34,197,94,0.3)' : 'rgba(168,85,247,0.2)'}`,
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: tb.status === 'confirmed' ? '#22c55e' : '#a855f7',
                        background: tb.status === 'confirmed' ? 'rgba(34,197,94,0.15)' : 'rgba(168,85,247,0.15)',
                      }}
                    >
                      {tb.status === 'confirmed' ? '3B 确认' : '3B? 候选'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {tb.pullbackLow && (
                      <span style={{ fontSize: 9, color: '#6b7fa3' }}>
                        回抽低: <span style={{ color: '#22c55e', fontFamily: 'JetBrains Mono, monospace' }}>{tb.pullbackLow.toFixed(4)}</span>
                      </span>
                    )}
                    {tb.confirmPrice && (
                      <span style={{ fontSize: 9, color: '#6b7fa3' }}>
                        确认价: <span style={{ color: '#22c55e', fontFamily: 'JetBrains Mono, monospace' }}>{tb.confirmPrice.toFixed(4)}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 9, color: '#4a5a7a' }}>
                  {toSGT((tb.confirmTime ?? tb.pullbackTime ?? tb.breakoutTime) * 1000)}
                </div>
              </div>
            ))}
          </div>
        )}

        {zhongshus.length === 0 && thirdBuys.length === 0 && (
          <div style={{ fontSize: 10, color: '#4a5a7a', textAlign: 'center', padding: '8px 0' }}>
            当前周期暂未识别到中枢结构
          </div>
        )}
      </div>
    </div>
  );
}
