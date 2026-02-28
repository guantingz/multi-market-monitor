// ============================================================
// Multi-Market Live Monitor — Market Data Proxy Service
// Data Sources:
//   FX / US / HK / Commodities → Yahoo Finance v8 API
//   A股 (CN)                   → 新浪财经 hq.sinajs.cn
//   Crypto                     → Binance REST API
// ============================================================

import axios from 'axios';
import NodeCache from 'node-cache';

// Cache: quote 10s, klines 30s
const quoteCache = new NodeCache({ stdTTL: 10, checkperiod: 5 });
const klinesCache = new NodeCache({ stdTTL: 30, checkperiod: 10 });

// ---- Symbol mapping to Yahoo Finance tickers ----
const YAHOO_SYMBOL_MAP: Record<string, string> = {
  // FX
  'EURUSD': 'EURUSD=X',
  'GBPUSD': 'GBPUSD=X',
  'USDJPY': 'JPY=X',
  'AUDUSD': 'AUDUSD=X',
  'USDCNH': 'CNY=X',
  // HK
  'HSI': '^HSI',
  'HSTECH': '^HSTECH',
  '0700.HK': '0700.HK',
  '9988.HK': '9988.HK',
  '3690.HK': '3690.HK',
  // US
  'SPY': 'SPY',
  'QQQ': 'QQQ',
  'AAPL': 'AAPL',
  'MSFT': 'MSFT',
  'NVDA': 'NVDA',
  // Commodities
  'XAUUSD': 'GC=F',
  'WTIUSD': 'CL=F',
  'BRTUSD': 'BZ=F',
  'HGUSD': 'HG=F',
  'SOYUSD': 'ZS=F',
};

// ---- Timeframe to Yahoo Finance interval/range ----
const TF_TO_YAHOO: Record<string, { interval: string; range: string }> = {
  '1D': { interval: '1d', range: '2y' },
  '4H': { interval: '1h', range: '60d' },
  '1H': { interval: '1h', range: '30d' },
  '15m': { interval: '15m', range: '7d' },
  '5m': { interval: '5m', range: '2d' },
};

// ---- OKX symbol map (replaces Binance due to geo-restriction) ----
const OKX_SYMBOL_MAP: Record<string, string> = {
  'BTCUSDT': 'BTC-USDT',
  'ETHUSDT': 'ETH-USDT',
  'SOLUSDT': 'SOL-USDT',
  'BNBUSDT': 'BNB-USDT',
  'XRPUSDT': 'XRP-USDT',
};

const OKX_TF_MAP: Record<string, string> = {
  '1D': '1D',
  '4H': '4H',
  '1H': '1H',
  '15m': '15m',
  '5m': '5m',
};

// ---- A股 symbol map (新浪财经格式) ----
// 上证: sh前缀, 深证: sz前缀
function toCNSinaSymbol(symbol: string): string {
  // Handle 1A0001 → sh000001 (上证指数)
  if (symbol === '1A0001') return 'sh000001';
  // ETFs: 510xxx → sh510xxx, 159xxx → sz159xxx, 588xxx → sh588xxx
  if (symbol.startsWith('51') || symbol.startsWith('58')) return `sh${symbol}`;
  if (symbol.startsWith('15') || symbol.startsWith('30')) return `sz${symbol}`;
  if (symbol.startsWith('00') || symbol.startsWith('39')) return `sh${symbol}`;
  return `sh${symbol}`;
}

// ---- Axios headers ----
const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ============================================================
// Yahoo Finance — Quote
// ============================================================
async function fetchYahooQuote(symbol: string): Promise<{
  price: number; change: number; changePct: number;
  open: number; high: number; low: number; prevClose: number; volume: number;
  name: string;
}> {
  const ticker = YAHOO_SYMBOL_MAP[symbol] ?? symbol;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`;
  const resp = await axios.get(url, { headers: YAHOO_HEADERS, timeout: 8000 });
  const result = resp.data?.chart?.result?.[0];
  if (!result) throw new Error(`No data for ${ticker}`);

  const meta = result.meta;
  const price = meta.regularMarketPrice ?? meta.previousClose;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change = price - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    price,
    change,
    changePct,
    open: meta.regularMarketOpen ?? price,
    high: meta.regularMarketDayHigh ?? price,
    low: meta.regularMarketDayLow ?? price,
    prevClose,
    volume: meta.regularMarketVolume ?? 0,
    name: meta.longName ?? meta.shortName ?? symbol,
  };
}

// ============================================================
// Yahoo Finance — Klines
// ============================================================
async function fetchYahooKlines(symbol: string, timeframe: string, limit: number): Promise<Array<{
  time: number; open: number; high: number; low: number; close: number; volume: number;
}>> {
  const ticker = YAHOO_SYMBOL_MAP[symbol] ?? symbol;
  const { interval, range } = TF_TO_YAHOO[timeframe] ?? { interval: '1d', range: '1y' };
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`;
  const resp = await axios.get(url, { headers: YAHOO_HEADERS, timeout: 10000 });
  const result = resp.data?.chart?.result?.[0];
  if (!result) throw new Error(`No kline data for ${ticker}`);

  const timestamps: number[] = result.timestamp ?? [];
  const ohlcv = result.indicators?.quote?.[0];
  if (!ohlcv || timestamps.length === 0) throw new Error(`Empty klines for ${ticker}`);

  const bars: Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }> = [];
  for (let i = 0; i < timestamps.length; i++) {
    const o = ohlcv.open?.[i];
    const h = ohlcv.high?.[i];
    const l = ohlcv.low?.[i];
    const c = ohlcv.close?.[i];
    if (o == null || h == null || l == null || c == null) continue;
    bars.push({
      time: timestamps[i],
      open: o, high: h, low: l, close: c,
      volume: ohlcv.volume?.[i] ?? 0,
    });
  }

  // For 4H: Yahoo returns 1h, aggregate to 4H
  const finalBars = timeframe === '4H' ? aggregateTo4H(bars) : bars;
  return finalBars.slice(-limit);
}

function aggregateTo4H(bars: Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>) {
  const result: typeof bars = [];
  let i = 0;
  while (i < bars.length) {
    const group = bars.slice(i, i + 4);
    if (group.length === 0) break;
    result.push({
      time: group[0].time,
      open: group[0].open,
      high: Math.max(...group.map(b => b.high)),
      low: Math.min(...group.map(b => b.low)),
      close: group[group.length - 1].close,
      volume: group.reduce((s, b) => s + b.volume, 0),
    });
    i += 4;
  }
  return result;
}

// ============================================================
// OKX — Quote (replaces Binance)
// ============================================================
async function fetchOKXQuote(symbol: string): Promise<{
  price: number; change: number; changePct: number;
  open: number; high: number; low: number; prevClose: number; volume: number;
  name: string;
}> {
  const ticker = OKX_SYMBOL_MAP[symbol] ?? symbol.replace('USDT', '-USDT');
  const url = `https://www.okx.com/api/v5/market/ticker?instId=${ticker}`;
  const resp = await axios.get(url, { timeout: 8000 });
  const d = resp.data?.data?.[0];
  if (!d) throw new Error(`No OKX data for ${ticker}`);
  const price = parseFloat(d.last);
  const open = parseFloat(d.open24h);
  const high = parseFloat(d.high24h);
  const low = parseFloat(d.low24h);
  const prevClose = parseFloat(d.sodUtc8 ?? d.open24h);
  const change = price - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;
  return {
    price, change, changePct,
    open, high, low, prevClose,
    volume: parseFloat(d.vol24h),
    name: symbol,
  };
}

// ============================================================
// OKX — Klines
// ============================================================
async function fetchOKXKlines(symbol: string, timeframe: string, limit: number): Promise<Array<{
  time: number; open: number; high: number; low: number; close: number; volume: number;
}>> {
  const ticker = OKX_SYMBOL_MAP[symbol] ?? symbol.replace('USDT', '-USDT');
  const bar = OKX_TF_MAP[timeframe] ?? '1D';
  const url = `https://www.okx.com/api/v5/market/candles?instId=${ticker}&bar=${bar}&limit=${Math.min(limit, 300)}`;
  const resp = await axios.get(url, { timeout: 10000 });
  const rows: string[][] = resp.data?.data ?? [];
  // OKX returns newest first, reverse to oldest first
  return rows.reverse().map(k => ({
    time: Math.floor(parseInt(k[0]) / 1000),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

// ============================================================
// 新浪财经 — A股 Quote
// ============================================================
async function fetchSinaQuote(symbol: string): Promise<{
  price: number; change: number; changePct: number;
  open: number; high: number; low: number; prevClose: number; volume: number;
  name: string;
}> {
  const sinaSymbol = toCNSinaSymbol(symbol);
  const url = `https://hq.sinajs.cn/list=${sinaSymbol}`;
  const resp = await axios.get(url, {
    headers: {
      'Referer': 'https://finance.sina.com.cn',
      'User-Agent': 'Mozilla/5.0',
    },
    timeout: 8000,
    responseType: 'arraybuffer',
  });
  // Decode GBK
  const decoder = new TextDecoder('gbk');
  const text = decoder.decode(resp.data as ArrayBuffer);
  // Format: var hq_str_sh000001="上证指数,3300.00,3289.00,3310.00,3320.00,3280.00,...";
  const match = text.match(/"([^"]+)"/);
  if (!match) throw new Error(`No data from Sina for ${symbol}`);
  const parts = match[1].split(',');
  if (parts.length < 10) throw new Error(`Unexpected Sina data format`);

  const name = parts[0];
  const open = parseFloat(parts[1]);
  const prevClose = parseFloat(parts[2]);
  const price = parseFloat(parts[3]);
  const high = parseFloat(parts[4]);
  const low = parseFloat(parts[5]);
  const volume = parseFloat(parts[8]) * 100; // 手 → 股
  const change = price - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return { price, change, changePct, open, high, low, prevClose, volume, name };
}

// ============================================================
// 新浪财经 — A股 Klines (via 腾讯财经 API)
// ============================================================
const CN_TF_MAP: Record<string, string> = {
  '1D': 'day',
  '4H': '240',
  '1H': '60',
  '15m': '15',
  '5m': '5',
};

async function fetchCNKlines(symbol: string, timeframe: string, limit: number): Promise<Array<{
  time: number; open: number; high: number; low: number; close: number; volume: number;
}>> {
  // 新浪财经 K线接口
  const sinaSymbol = symbol === '1A0001' ? 'sh000001' : toCNSinaSymbol(symbol);
  const period = CN_TF_MAP[timeframe] ?? 'day';
  const count = Math.min(limit, 640);

  // scale: 240=日K, 60=60分钟, 30=30分钟, 15=15分钟, 5=5分钟
  const scaleMap: Record<string, number> = {
    'day': 240, '60': 60, '30': 30, '15': 15, '5': 5,
  };
  const scale = scaleMap[period] ?? 240;

  const url = `https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=${sinaSymbol}&scale=${scale}&ma=no&datalen=${count}`;

  const resp = await axios.get(url, {
    headers: { 'Referer': 'https://finance.sina.com.cn', 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
  });

  const rawData: Array<{day: string; open: string; high: string; low: string; close: string; volume: string}> = resp.data;
  if (!Array.isArray(rawData) || rawData.length === 0) {
    throw new Error(`No CN klines for ${symbol}`);
  }

  return rawData.map(k => {
    const time = Math.floor(new Date(k.day).getTime() / 1000);
    return {
      time,
      open: parseFloat(k.open),
      high: parseFloat(k.high),
      low: parseFloat(k.low),
      close: parseFloat(k.close),
      volume: parseFloat(k.volume ?? '0'),
    };
  }).filter(b => !isNaN(b.time) && !isNaN(b.open));
}

// ============================================================
// Public API
// ============================================================

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

function getMarketType(symbol: string): MarketType {
  if (OKX_SYMBOL_MAP[symbol]) return 'crypto';
  if (symbol === '1A0001' || symbol.match(/^(51|15|58|00|30)/)) return 'cn';
  return 'other' as MarketType;
}

export async function getQuote(symbol: string, market: MarketType): Promise<QuoteResult> {
  const cacheKey = `quote:${symbol}`;
  const cached = quoteCache.get<QuoteResult>(cacheKey);
  if (cached) return cached;

  let data: Awaited<ReturnType<typeof fetchYahooQuote>>;
  let source = 'yahoo';

  try {
    if (market === 'crypto') {
      data = await fetchOKXQuote(symbol);
      source = 'okx';
    } else if (market === 'cn') {
      data = await fetchSinaQuote(symbol);
      source = 'sina';
    } else {
      data = await fetchYahooQuote(symbol);
      source = 'yahoo';
    }
  } catch (err) {
    console.error(`[MarketData] Quote fetch failed for ${symbol}:`, err);
    throw err;
  }

  const result: QuoteResult = {
    symbol,
    name: data.name,
    price: data.price,
    change: data.change,
    changePct: data.changePct,
    open: data.open,
    high: data.high,
    low: data.low,
    prevClose: data.prevClose,
    volume: data.volume,
    updatedAt: Date.now(),
    source,
  };

  quoteCache.set(cacheKey, result);
  return result;
}

export async function getKlines(symbol: string, market: MarketType, timeframe: string, limit: number): Promise<KlineBar[]> {
  const cacheKey = `klines:${symbol}:${timeframe}:${limit}`;
  const cached = klinesCache.get<KlineBar[]>(cacheKey);
  if (cached) return cached;

  let bars: KlineBar[];

  try {
    if (market === 'crypto') {
      bars = await fetchOKXKlines(symbol, timeframe, limit);
    } else if (market === 'cn') {
      bars = await fetchCNKlines(symbol, timeframe, limit);
    } else {
      bars = await fetchYahooKlines(symbol, timeframe, limit);
    }
  } catch (err) {
    console.error(`[MarketData] Klines fetch failed for ${symbol}:`, err);
    throw err;
  }

  // Sort by time ascending, deduplicate
  bars.sort((a, b) => a.time - b.time);
  const deduped = bars.filter((b, i) => i === 0 || b.time !== bars[i - 1].time);

  klinesCache.set(cacheKey, deduped);
  return deduped;
}
