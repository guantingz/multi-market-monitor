// ============================================================
// Multi-Market Live Monitor — Real Data Adapter
// Calls backend tRPC proxy → Yahoo Finance / OKX / 新浪财经
// Falls back to mock data if the real API fails
// ============================================================

import type { OHLCBar, QuoteSnapshot, MarketType, Timeframe } from './types';
import { getMockQuote, getMockKlines } from './mockDataEngine';

// tRPC fetch helper — superjson transformer requires {json: input} wrapper
const API_BASE = '/api/trpc';

async function trpcQuery<T>(procedure: string, input: unknown): Promise<T> {
  // superjson transformer expects the input wrapped as { json: <value> }
  const encoded = encodeURIComponent(JSON.stringify({ json: input }));
  const url = `${API_BASE}/${procedure}?input=${encoded}`;
  const resp = await fetch(url, { credentials: 'include' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();
  if (json.error) throw new Error(json.error?.json?.message ?? json.error.message ?? 'tRPC error');
  // superjson response: result.data.json
  const data = json.result?.data?.json ?? json.result?.data;
  if (data === undefined || data === null) throw new Error('Empty response from server');
  return data as T;
}

// ---- Quote ----
export async function getRealQuote(symbol: string, market: MarketType): Promise<QuoteSnapshot> {
  try {
    const data = await trpcQuery<{
      symbol: string; name: string; price: number; change: number; changePct: number;
      open: number; high: number; low: number; prevClose: number; volume: number; updatedAt: number;
    }>('market.quote', { symbol, market });

    return {
      symbol: data.symbol,
      name: data.name,
      price: data.price,
      change: data.change,
      changePct: data.changePct,
      open: data.open,
      high: data.high,
      low: data.low,
      prevClose: data.prevClose,
      volume: data.volume,
      updatedAt: data.updatedAt,
      market,
      isDelayed: false,
    };
  } catch (err) {
    console.warn(`[RealData] Quote failed for ${symbol}, falling back to mock:`, err);
    return getMockQuote(symbol, market);
  }
}

// ---- Klines ----
export async function getRealKlines(
  symbol: string,
  market: MarketType,
  timeframe: Timeframe,
  limit: number = 300
): Promise<OHLCBar[]> {
  try {
    const bars = await trpcQuery<Array<{
      time: number; open: number; high: number; low: number; close: number; volume: number;
    }>>('market.klines', { symbol, market, timeframe, limit });

    if (!bars || bars.length < 5) {
      throw new Error(`Insufficient kline data: ${bars?.length ?? 0} bars`);
    }

    return bars.map(b => ({
      time: b.time,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      volume: b.volume,
    }));
  } catch (err) {
    console.warn(`[RealData] Klines failed for ${symbol}/${timeframe}, falling back to mock:`, err);
    return getMockKlines(symbol, market, timeframe, limit);
  }
}

// ---- Batch quotes for watchlist ----
export async function getRealQuotesBatch(
  items: Array<{ symbol: string; market: MarketType }>
): Promise<Map<string, QuoteSnapshot>> {
  const result = new Map<string, QuoteSnapshot>();
  try {
    const data = await trpcQuery<Array<{
      symbol: string;
      data: {
        symbol: string; name: string; price: number; change: number; changePct: number;
        open: number; high: number; low: number; prevClose: number; volume: number; updatedAt: number;
      } | null;
      error: string | null;
    }>>('market.quotes', { symbols: items });

    for (const item of data) {
      if (item.data) {
        const market = items.find(i => i.symbol === item.symbol)?.market ?? 'us';
        result.set(item.symbol, {
          ...item.data,
          market,
          isDelayed: false,
        });
      }
    }
  } catch (err) {
    console.warn('[RealData] Batch quotes failed, falling back to mock:', err);
    // Fallback: fetch mock for each
    for (const { symbol, market } of items) {
      result.set(symbol, await getMockQuote(symbol, market));
    }
  }
  return result;
}
