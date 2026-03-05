// ============================================================
// Multi-Market Live Monitor — Market Data Proxy Service (v2.0)
// Optimized for: Stability, Time-Alignment, and High Concurrency
// ============================================================

import axios from 'axios';
import NodeCache from 'node-cache';

// --- Types ---
export type MarketType = 'fx' | 'cn' | 'hk' | 'us' | 'crypto' | 'commodities';

export interface QuoteResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  updatedAt: number;
  source: string;
}

export interface KlineBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// --- Configuration & Cache ---
const quoteCache = new NodeCache({ stdTTL: 10, checkperiod: 5 });
const klinesCache = new NodeCache({ stdTTL: 30, checkperiod: 10 });
const pendingRequests = new Map<string, Promise<any>>();

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
};

// --- Mapping Tables (Keep your existing mappings) ---
const YAHOO_SYMBOL_MAP: Record<string, string> = {
  'EURUSD': 'EURUSD=X', 'GBPUSD': 'GBPUSD=X', 'USDJPY': 'JPY=X', 'AUDUSD': 'AUDUSD=X', 'USDCNH': 'CNY=X',
  'HSI': '^HSI', 'HSTECH': '^HSTECH', '0700.HK': '0700.HK', '9988.HK': '9988.HK', '3690.HK': '3690.HK',
  'SPY': 'SPY', 'QQQ': 'QQQ', 'AAPL': 'AAPL', 'MSFT': 'MSFT', 'NVDA': 'NVDA',
  'XAUUSD': 'GC=F', 'WTIUSD': 'CL=F', 'BRTUSD': 'BZ=F',
};

const OKX_SYMBOL_MAP: Record<string, string> = {
  'BTCUSDT': 'BTC-USDT', 'ETHUSDT': 'ETH-USDT', 'SOLUSDT': 'SOL-USDT',
};

// ============================================================
// Utilities: Aggregation & Logic
// ============================================================

/**
 * 时间桶聚合算法：确保 4H 等大周期 K 线严格对齐 Unix 时间戳
 * 防止因数据源缺失导致的时间轴错位
 */

function aggregateKlines(bars: KlineBar[], timeframe: string): KlineBar[] {
  if (timeframe !== '4H') return bars;
  
  const PERIOD = 4 * 3600; // 4小时秒数
  const buckets = new Map<number, KlineBar[]>();

  for (const bar of bars) {
    const bucketTime = Math.floor(bar.time / PERIOD) * PERIOD;
    if (!buckets.has(bucketTime)) buckets.set(bucketTime, []);
    buckets.get(bucketTime)!.push(bar);
  }

  return Array.from(buckets.keys())
    .sort((a, b) => a - b)
    .map(time => {
      const group = buckets.get(time)!;
      return {
        time,
        open: group[0].open,
        high: Math.max(...group.map(b => b.high)),
        low: Math.min(...group.map(b => b.low)),
        close: group[group.length - 1].close,
        volume: group.reduce((s, b) => s + b.volume, 0),
      };
    });
}

function toCNSinaSymbol(symbol: string): string {
  if (symbol === '1A0001') return 'sh000001';
  if (/^(51|58|60)/.test(symbol)) return `sh${symbol}`;
  if (/^(15|30|00|39)/.test(symbol)) return `sz${symbol}`;
  return `sh${symbol}`;
}

// ============================================================
// Core Fetchers (with Stability Improvements)
// ============================================================

// 1. A-Share: Sina + Tencent Fallback
async function fetchCNQuote(symbol: string): Promise<Omit<QuoteResult, 'symbol' | 'updatedAt' | 'source'>> {
  const sinaSymbol = toCNSinaSymbol(symbol);
  
  const attemptSina = async () => {
    const url = `https://hq.sinajs.cn/list=${sinaSymbol}`;
    const resp = await axios.get(url, { 
      headers: { 'Referer': 'https://finance.sina.com.cn' }, 
      timeout: 5000, 
      responseType: 'arraybuffer' 
    });
    const text = new TextDecoder('gbk').decode(resp.data);
    const match = text.match(/"([^"]+)"/);
    if (!match) throw new Error("Sina empty");
    const p = match[1].split(',');
    return {
      name: p[0], open: +p[1], prevClose: +p[2], price: +p[3],
      high: +p[4], low: +p[5], volume: +p[8] * 100,
      change: +p[3] - +p[2], changePct: ((+p[3] - +p[2]) / +p[2]) * 100
    };
  };

  const attemptTencent = async () => {
    const url = `http://qt.gtimg.cn/q=${sinaSymbol}`;
    const resp = await axios.get(url, { timeout: 5000, responseType: 'arraybuffer' });
    const text = new TextDecoder('gbk').decode(resp.data);
    const p = text.split('~');
    if (p.length < 10) throw new Error("Tencent empty");
    return {
      name: p[1], open: +p[5], prevClose: +p[4], price: +p[3],
      high: +p[33], low: +p[34], volume: +p[36] * 100,
      change: +p[31], changePct: +p[32]
    };
  };

  try {
    return await attemptSina();
  } catch {
    console.log(`[Switching] Sina failed for ${symbol}, trying Tencent...`);
    return await attemptTencent();
  }
}

// 2. Crypto: OKX
async function fetchOKXQuote(symbol: string) {
  const ticker = OKX_SYMBOL_MAP[symbol] ?? symbol.replace('USDT', '-USDT');
  const url = `https://www.okx.com/api/v5/market/ticker?instId=${ticker}`;
  const resp = await axios.get(url, { timeout: 6000 });
  const d = resp.data?.data?.[0];
  if (!d) throw new Error("OKX empty");
  
  const price = parseFloat(d.last);
  const prevClose = parseFloat(d.sodUtc8 || d.open24h);
  return {
    price, open: parseFloat(d.open24h), high: parseFloat(d.high24h),
    low: parseFloat(d.low24h), prevClose, volume: parseFloat(d.vol24h),
    change: price - prevClose, changePct: ((price - prevClose) / prevClose) * 100,
    name: symbol
  };
}

// 3. Global: Yahoo Finance
async function fetchYahooQuote(symbol: string) {
  const ticker = YAHOO_SYMBOL_MAP[symbol] ?? symbol;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`;
  const resp = await axios.get(url, { headers: YAHOO_HEADERS, timeout: 8000 });
  const meta = resp.data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error("Yahoo empty");

  const price = meta.regularMarketPrice ?? meta.previousClose;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose;
  return {
    price, open: meta.regularMarketOpen ?? price, high: meta.regularMarketDayHigh ?? price,
    low: meta.regularMarketDayLow ?? price, prevClose, volume: meta.regularMarketVolume ?? 0,
    change: price - prevClose, changePct: ((price - prevClose) / prevClose) * 100,
    name: meta.longName ?? meta.shortName ?? symbol
  };
}

// ============================================================
// Public Interface (with Request Collapsing)
// ============================================================

export async function getQuote(symbol: string, market: MarketType): Promise<QuoteResult> {
  const cacheKey = `quote:${symbol}`;
  const cached = quoteCache.get<QuoteResult>(cacheKey);
  if (cached) return cached;

  // 请求合并：防止瞬时高并发击穿 API
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const task = (async () => {
    try {
      let data: any;
      let source = 'yahoo';

      if (market === 'crypto') { data = await fetchOKXQuote(symbol); source = 'okx'; }
      else if (market === 'cn') { data = await fetchCNQuote(symbol); source = 'sina/tencent'; }
      else { data = await fetchYahooQuote(symbol); source = 'yahoo'; }

      const result: QuoteResult = { 
        symbol, ...data, updatedAt: Date.now(), source 
      };
      quoteCache.set(cacheKey, result);
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, task);
  return task;
}

export async function getKlines(symbol: string, market: MarketType, timeframe: string, limit: number): Promise<KlineBar[]> {
  const cacheKey = `klines:${symbol}:${timeframe}:${limit}`;
  const cached = klinesCache.get<KlineBar[]>(cacheKey);
  if (cached) return cached;

  // 此处可同样增加针对 K 线的 Request Collapsing 逻辑
  let bars: KlineBar[] = [];
  try {
    if (market === 'crypto') {
      // 这里的 fetchOKXKlines 逻辑保持你原有的，但确保返回后调用聚合
      // ... (省略 fetchOKXKlines 代码，逻辑同前)
    } else if (market === 'cn') {
      // 这里的 fetchCNKlines 需注意时区补偿
      // ... 
    } else {
      // Yahoo 接口逻辑
    }
    
    // 关键修正：聚合与对齐
    const finalBars = aggregateKlines(bars, timeframe);
    const result = finalBars.slice(-limit);
    klinesCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`Klines error: ${symbol}`, err);
    throw err;
  }
}
