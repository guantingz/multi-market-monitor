// ============================================================
// Multi-Market Live Monitor — Zhongshu Box Primitive
// Draws Chanlun Zhongshu (中枢) rectangles on the K-line chart
// Uses lightweight-charts v5 ISeriesPrimitive API
// ============================================================

import type {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  Time,
  IChartApiBase,
  ISeriesApi,
  SeriesType,
} from 'lightweight-charts';
import type { Zhongshu } from './types';

// ---- Renderer: draws one zhongshu box ----
interface ZhongshuBoxData {
  x1: number;
  x2: number;
  y1: number; // top (lower price = higher y)
  y2: number; // bottom (higher price = lower y)
  isActive: boolean;
  label: string;
}

class ZhongshuBoxRenderer implements IPrimitivePaneRenderer {
  private _boxes: ZhongshuBoxData[];

  constructor(boxes: ZhongshuBoxData[]) {
    this._boxes = boxes;
  }

  draw(target: { useMediaCoordinateSpace: (cb: (scope: { context: CanvasRenderingContext2D }) => void) => void }): void {
    target.useMediaCoordinateSpace(({ context: ctx }) => {
      for (const box of this._boxes) {
        if (box.x1 === null || box.x2 === null || box.y1 === null || box.y2 === null) continue;
        if (isNaN(box.x1) || isNaN(box.x2) || isNaN(box.y1) || isNaN(box.y2)) continue;

        const x = Math.min(box.x1, box.x2);
        const w = Math.abs(box.x2 - box.x1);
        const y = Math.min(box.y1, box.y2);
        const h = Math.abs(box.y2 - box.y1);

        if (w < 1 || h < 1) continue;

        // Box fill
        ctx.save();
        ctx.globalAlpha = box.isActive ? 0.12 : 0.06;
        ctx.fillStyle = box.isActive ? '#a855f7' : '#6b7fa3';
        ctx.fillRect(x, y, w, h);

        // Box border
        ctx.globalAlpha = box.isActive ? 0.70 : 0.35;
        ctx.strokeStyle = box.isActive ? '#a855f7' : '#6b7fa3';
        ctx.lineWidth = box.isActive ? 1.5 : 1;
        ctx.setLineDash(box.isActive ? [] : [4, 3]);
        ctx.strokeRect(x, y, w, h);

        // Label
        ctx.globalAlpha = box.isActive ? 0.90 : 0.50;
        ctx.fillStyle = box.isActive ? '#d8b4fe' : '#9ca3af';
        ctx.font = `bold 10px "JetBrains Mono", monospace`;
        ctx.textBaseline = 'top';
        ctx.fillText(box.label, x + 4, y + 3);

        ctx.restore();
      }
    });
  }
}

// ---- Pane View ----
class ZhongshuPaneView implements IPrimitivePaneView {
  private _primitive: ZhongshuPrimitive;

  constructor(primitive: ZhongshuPrimitive) {
    this._primitive = primitive;
  }

  zOrder(): 'normal' | 'bottom' | 'top' {
    return 'bottom';
  }

  renderer(): IPrimitivePaneRenderer | null {
    return this._primitive.getRenderer();
  }
}

// ---- Main Primitive ----
export class ZhongshuPrimitive implements ISeriesPrimitive<Time> {
  private _zhongshus: Zhongshu[] = [];
  private _chart: IChartApiBase<Time> | null = null;
  private _series: ISeriesApi<SeriesType, Time> | null = null;
  private _requestUpdate: (() => void) | null = null;
  private _paneView: ZhongshuPaneView;
  private _boxes: ZhongshuBoxData[] = [];

  constructor() {
    this._paneView = new ZhongshuPaneView(this);
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    this._chart = param.chart;
    this._series = param.series as ISeriesApi<SeriesType, Time>;
    this._requestUpdate = param.requestUpdate;
    this._rebuildBoxes();
  }

  detached(): void {
    this._chart = null;
    this._series = null;
    this._requestUpdate = null;
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return [this._paneView];
  }

  updateAllViews(): void {
    this._rebuildBoxes();
  }

  setZhongshus(zhongshus: Zhongshu[]): void {
    this._zhongshus = zhongshus;
    this._rebuildBoxes();
    this._requestUpdate?.();
  }

  getRenderer(): IPrimitivePaneRenderer {
    return new ZhongshuBoxRenderer(this._boxes);
  }

  private _rebuildBoxes(): void {
    if (!this._chart || !this._series) {
      this._boxes = [];
      return;
    }

    const timeScale = this._chart.timeScale();
    const boxes: ZhongshuBoxData[] = [];

    // Show only the most recent 5 zhongshus to avoid clutter
    const recent = this._zhongshus.slice(-5);

    for (const z of recent) {
      // Convert time to x coordinate
      const x1 = timeScale.timeToCoordinate(z.startTime as Time);
      // For active zhongshu, extend to current time; otherwise use endTime
      const endT = z.isActive
        ? (this._getLatestTime() ?? z.endTime)
        : z.endTime;
      const x2 = timeScale.timeToCoordinate(endT as Time);

      // Convert price to y coordinate
      const y1 = this._series.priceToCoordinate(z.high); // top of box (high price)
      const y2 = this._series.priceToCoordinate(z.low);  // bottom of box (low price)

      if (x1 === null || x2 === null || y1 === null || y2 === null) continue;

      const label = z.isActive ? `ZS` : `ZS`;

      boxes.push({
        x1,
        x2,
        y1,
        y2,
        isActive: z.isActive,
        label,
      });
    }

    this._boxes = boxes;
  }

  private _getLatestTime(): number | null {
    // Get the rightmost visible time from time scale
    const visibleRange = this._chart?.timeScale().getVisibleRange();
    if (visibleRange) return visibleRange.to as unknown as number;
    return null;
  }
}
