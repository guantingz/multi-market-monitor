// ============================================================
// Multi-Market Live Monitor — Mock Data Engine
// Generates realistic OHLC data with random walk + volatility
// Design: Quant Terminal (Deep Navy Dark)
// ============================================================

import type { OHLCBar, QuoteSnapshot, MarketType, Timeframe } from './types';

// ---- Seed data for each symbol ----
interface SymbolConfig {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number; // daily % volatility
  market: MarketType;
}

export const MARKET_SYMBOLS: Record<MarketType, SymbolConfig[]> = {
  fx: [
    { symbol: 'EURUSD', name: 'Euro / US Dollar', basePrice: 1.0842, volatility: 0.003, market: 'fx' },
    { symbol: 'GBPUSD', name: 'British Pound / US Dollar', basePrice: 1.2634, volatility: 0.004, market: 'fx' },
    { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', basePrice: 149.82, volatility: 0.005, market: 'fx' },
    { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', basePrice: 0.6521, volatility: 0.005, market: 'fx' },
    { symbol: 'USDCNH', name: 'US Dollar / Chinese Yuan', basePrice: 7.2415, volatility: 0.002, market: 'fx' },
  ],
  cn: [
    { symbol: '1A0001', name: '上证指数', basePrice: 3089.26, volatility: 0.012, market: 'cn' },
    { symbol: '510300', name: '沪深300ETF', basePrice: 3.892, volatility: 0.012, market: 'cn' },
    { symbol: '159915', name: '创业板ETF', basePrice: 1.624, volatility: 0.018, market: 'cn' },
    { symbol: '512500', name: '中证500ETF', basePrice: 5.218, volatility: 0.014, market: 'cn' },
    { symbol: '588000', name: '科创50ETF', basePrice: 0.892, volatility: 0.020, market: 'cn' },
  ],
  hk: [
    { symbol: 'HSI', name: '恒生指数', basePrice: 19842.5, volatility: 0.015, market: 'hk' },
    { symbol: 'HSTECH', name: '恒生科技指数', basePrice: 4218.3, volatility: 0.022, market: 'hk' },
    { symbol: '0700.HK', name: '腾讯控股', basePrice: 382.4, volatility: 0.018, market: 'hk' },
    { symbol: '9988.HK', name: '阿里巴巴-SW', basePrice: 84.65, volatility: 0.022, market: 'hk' },
    { symbol: '3690.HK', name: '美团-W', basePrice: 148.2, volatility: 0.025, market: 'hk' },
  ],
  us: [
    { symbol: 'SPY', name: 'S&P 500 ETF', basePrice: 589.42, volatility: 0.010, market: 'us' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', basePrice: 512.38, volatility: 0.013, market: 'us' },
    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 228.52, volatility: 0.015, market: 'us' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 415.28, volatility: 0.014, market: 'us' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 875.42, volatility: 0.028, market: 'us' },
  ],
  crypto: [
    { symbol: 'BTCUSDT', name: 'Bitcoin / USDT', basePrice: 94820.0, volatility: 0.030, market: 'crypto' },
    { symbol: 'ETHUSDT', name: 'Ethereum / USDT', basePrice: 3284.5, volatility: 0.035, market: 'crypto' },
    { symbol: 'SOLUSDT', name: 'Solana / USDT', basePrice: 198.42, volatility: 0.045, market: 'crypto' },
    { symbol: 'BNBUSDT', name: 'BNB / USDT', basePrice: 652.8, volatility: 0.028, market: 'crypto' },
    { symbol: 'XRPUSDT', name: 'XRP / USDT', basePrice: 2.485, volatility: 0.040, market: 'crypto' },
  ],
  commodities: [
    { symbol: 'WTIUSD', name: 'WTI Crude Oil', basePrice: 72.84, volatility: 0.018, market: 'commodities' },
    { symbol: 'BRTUSD', name: 'Brent Crude Oil', basePrice: 76.92, volatility: 0.017, market: 'commodities' },
    { symbol: 'XAUUSD', name: 'Gold Spot', basePrice: 2928.5, volatility: 0.008, market: 'commodities' },
    { symbol: 'HGUSD', name: 'Copper Futures', basePrice: 4.285, volatility: 0.015, market: 'commodities' },
    { symbol: 'SOYUSD', name: 'Soybean Futures', basePrice: 985.4, volatility: 0.012, market: 'commodities' },
  ],
};

// ---- Timeframe to seconds ----
const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1D': 86400,
  '4H': 14400,
  '1H': 3600,
  '15m': 900,
  '5m': 300,
};

// ---- Seeded random number generator (deterministic per symbol) ----
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function symbolSeed(symbol: string): number {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) {
    h = (Math.imul(31, h) + symbol.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ---- Generate OHLC bars ----
export function generateOHLCBars(
  symbol: string,
  basePrice: number,
  volatility: number,
  timeframe: Timeframe,
  limit: number = 200
): OHLCBar[] {
  const tfSeconds = TIMEFRAME_SECONDS[timeframe];
  const now = Math.floor(Date.now() / 1000);
  // Align to timeframe boundary
  const alignedNow = Math.floor(now / tfSeconds) * tfSeconds;

  const rand = seededRandom(symbolSeed(symbol) + tfSeconds);
  const bars: OHLCBar[] = [];

  // Scale volatility per bar
  const barVol = volatility * Math.sqrt(tfSeconds / 86400);

  let price = basePrice * (0.85 + rand() * 0.30); // start from a range

  for (let i = limit - 1; i >= 0; i--) {
    const t = alignedNow - i * tfSeconds;
    const open = price;
    const move = (rand() - 0.5) * 2 * barVol * price;
    const close = Math.max(open * 0.5, open + move);
    const highExtra = rand() * barVol * price * 0.5;
    const lowExtra = rand() * barVol * price * 0.5;
    const high = Math.max(open, close) + highExtra;
    const low = Math.min(open, close) - lowExtra;
    const volume = Math.floor(1000 + rand() * 50000);

    bars.push({ time: t, open, high, low, close, volume });
    price = close;
  }

  return bars;
}

// ---- Cache for generated bars (avoid regenerating on every call) ----
const barsCache = new Map<string, OHLCBar[]>();
const quotesCache = new Map<string, QuoteSnapshot>();

function getCacheKey(symbol: string, timeframe: Timeframe): string {
  return `${symbol}:${timeframe}`;
}

// ---- Live price simulation (incremental updates) ----
const livePrices = new Map<string, number>();
const priceCallbacks = new Map<string, Set<(q: QuoteSnapshot) => void>>();

function getSymbolConfig(symbol: string): SymbolConfig | undefined {
  for (const configs of Object.values(MARKET_SYMBOLS)) {
    const found = configs.find(c => c.symbol === symbol);
    if (found) return found;
  }
  return undefined;
}

function getLivePrice(symbol: string): number {
  if (livePrices.has(symbol)) return livePrices.get(symbol)!;
  const cfg = getSymbolConfig(symbol);
  if (!cfg) return 100;
  const rand = seededRandom(symbolSeed(symbol) + Date.now());
  const price = cfg.basePrice * (0.95 + rand() * 0.10);
  livePrices.set(symbol, price);
  return price;
}

function tickPrice(symbol: string): number {
  const cfg = getSymbolConfig(symbol);
  if (!cfg) return getLivePrice(symbol);
  const current = getLivePrice(symbol);
  const move = (Math.random() - 0.5) * 2 * cfg.volatility * current * 0.1;
  const next = Math.max(current * 0.5, current + move);
  livePrices.set(symbol, next);
  return next;
}

// ---- Mock Adapter ----
export class MockMarketDataAdapter {
  name = 'Mock Data Engine';
  isRealtime = false;
  delayMinutes = 0;

  constructor(public market: MarketType) {}

  async getQuote(symbol: string): Promise<QuoteSnapshot> {
    const cfg = getSymbolConfig(symbol);
    if (!cfg) throw new Error(`Unknown symbol: ${symbol}`);

    const price = getLivePrice(symbol);
    const prevClose = price * (1 + (Math.random() - 0.5) * cfg.volatility * 2);
    const change = price - prevClose;
    const changePct = (change / prevClose) * 100;

    const q: QuoteSnapshot = {
      symbol,
      name: cfg.name,
      price,
      change,
      changePct,
      open: prevClose * (1 + (Math.random() - 0.5) * cfg.volatility),
      high: price * (1 + Math.random() * cfg.volatility * 0.5),
      low: price * (1 - Math.random() * cfg.volatility * 0.5),
      prevClose,
      volume: Math.floor(100000 + Math.random() * 5000000),
      updatedAt: Date.now(),
      isDelayed: false,
      market: cfg.market,
    };

    if (cfg.market === 'fx') {
      q.spread = price * 0.0001;
      q.bid = price - (q.spread / 2);
      q.ask = price + (q.spread / 2);
    }

    quotesCache.set(symbol, q);
    return q;
  }

  async getKlines(symbol: string, timeframe: Timeframe, limit = 200): Promise<OHLCBar[]> {
    const key = getCacheKey(symbol, timeframe);
    if (barsCache.has(key)) {
      const cached = barsCache.get(key)!;
      // Append a new bar if needed
      return appendLatestBar(cached, symbol, timeframe);
    }

    const cfg = getSymbolConfig(symbol);
    if (!cfg) throw new Error(`Unknown symbol: ${symbol}`);

    const bars = generateOHLCBars(symbol, cfg.basePrice, cfg.volatility, timeframe, limit);
    barsCache.set(key, bars);
    return bars;
  }

  subscribeQuote(symbol: string, callback: (q: QuoteSnapshot) => void): () => void {
    if (!priceCallbacks.has(symbol)) {
      priceCallbacks.set(symbol, new Set());
    }
    priceCallbacks.get(symbol)!.add(callback);

    // Start ticking
    const interval = setInterval(async () => {
      tickPrice(symbol);
      const q = await this.getQuote(symbol);
      callback(q);
    }, 2000 + Math.random() * 1000);

    return () => {
      clearInterval(interval);
      priceCallbacks.get(symbol)?.delete(callback);
    };
  }
}

function appendLatestBar(bars: OHLCBar[], symbol: string, timeframe: Timeframe): OHLCBar[] {
  const tfSeconds = TIMEFRAME_SECONDS[timeframe];
  const now = Math.floor(Date.now() / 1000);
  const currentBarTime = Math.floor(now / tfSeconds) * tfSeconds;
  const lastBar = bars[bars.length - 1];

  if (lastBar.time === currentBarTime) {
    // Update last bar with live price
    const livePrice = getLivePrice(symbol);
    const updated = { ...lastBar };
    updated.close = livePrice;
    updated.high = Math.max(lastBar.high, livePrice);
    updated.low = Math.min(lastBar.low, livePrice);
    const newBars = [...bars.slice(0, -1), updated];
    barsCache.set(getCacheKey(symbol, timeframe), newBars);
    return newBars;
  } else if (currentBarTime > lastBar.time) {
    // New bar started
    const cfg = getSymbolConfig(symbol);
    const vol = cfg?.volatility ?? 0.01;
    const open = lastBar.close;
    const close = getLivePrice(symbol);
    const high = Math.max(open, close) * (1 + Math.random() * vol * 0.3);
    const low = Math.min(open, close) * (1 - Math.random() * vol * 0.3);
    const newBar: OHLCBar = {
      time: currentBarTime,
      open,
      high,
      low,
      close,
      volume: Math.floor(10000 + Math.random() * 500000),
    };
    const newBars = [...bars.slice(1), newBar];
    barsCache.set(getCacheKey(symbol, timeframe), newBars);
    return newBars;
  }

  return bars;
}

// ---- Adapter Registry ----
const adapterRegistry = new Map<MarketType, MockMarketDataAdapter>();

export function getAdapter(market: MarketType): MockMarketDataAdapter {
  if (!adapterRegistry.has(market)) {
    adapterRegistry.set(market, new MockMarketDataAdapter(market));
  }
  return adapterRegistry.get(market)!;
}

// ---- Format helpers ----
export function formatPrice(price: number, symbol: string): string {
  const cfg = getSymbolConfig(symbol);
  if (!cfg) return price.toFixed(2);

  if (cfg.market === 'fx') {
    if (symbol.includes('JPY') || symbol.includes('CNH')) return price.toFixed(3);
    return price.toFixed(4);
  }
  if (cfg.market === 'crypto') {
    if (price > 1000) return price.toFixed(1);
    if (price > 10) return price.toFixed(2);
    return price.toFixed(4);
  }
  if (price > 10000) return price.toFixed(0);
  if (price > 100) return price.toFixed(2);
  return price.toFixed(3);
}

export function formatChangePct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

// SGT = UTC+8
export function toSGT(timestamp: number): string {
  const d = new Date(timestamp);
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const sgtMs = utcMs + 8 * 3600000;
  const sgt = new Date(sgtMs);
  return sgt.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

// ---- Standalone fallback helpers for realDataAdapter ----
export async function getMockQuote(symbol: string, market: MarketType): Promise<QuoteSnapshot> {
  const adapter = getAdapter(market);
  return adapter.getQuote(symbol);
}

export async function getMockKlines(
  symbol: string,
  market: MarketType,
  timeframe: Timeframe,
  limit: number
): Promise<OHLCBar[]> {
  const adapter = getAdapter(market);
  return adapter.getKlines(symbol, timeframe, limit);
}
