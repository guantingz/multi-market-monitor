// ============================================================
// Multi-Market Live Monitor — All Available Symbols (v2.0)
// Optimized for: Comprehensive A-Share Coverage & Mapping Logic
// ============================================================

export type MarketType = 'fx' | 'cn' | 'hk' | 'us' | 'crypto' | 'commodities';

export interface SymbolInfo {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
  market: MarketType;
  category?: string; // 细分分类：如 'Index', 'Tech', 'ETF' 等
}

// ============================================================
// 1. Full Market Symbols Data
// ============================================================

export const ALL_MARKET_SYMBOLS: Record<MarketType, SymbolInfo[]> = {
  fx: [
    { symbol: 'EURUSD', name: '欧元/美元', basePrice: 1.0842, volatility: 0.003, market: 'fx' },
    { symbol: 'GBPUSD', name: '英镑/美元', basePrice: 1.2634, volatility: 0.004, market: 'fx' },
    { symbol: 'USDJPY', name: '美元/日元', basePrice: 149.82, volatility: 0.005, market: 'fx' },
    { symbol: 'AUDUSD', name: '澳元/美元', basePrice: 0.6521, volatility: 0.005, market: 'fx' },
    { symbol: 'USDCNH', name: '美元/离岸人民币', basePrice: 7.2415, volatility: 0.002, market: 'fx' },
    { symbol: 'USDCAD', name: '美元/加元', basePrice: 1.3612, volatility: 0.004, market: 'fx' },
    { symbol: 'USDCHF', name: '美元/瑞郎', basePrice: 0.8942, volatility: 0.003, market: 'fx' },
    { symbol: 'NZDUSD', name: '纽元/美元', basePrice: 0.6012, volatility: 0.005, market: 'fx' },
    { symbol: 'USDHKD', name: '美元/港币', basePrice: 7.8212, volatility: 0.001, market: 'fx' },
    { symbol: 'GBPJPY', name: '英镑/日元', basePrice: 189.32, volatility: 0.007, market: 'fx' },
  ],

  cn: [
    // --- 指数 & ETF ---
    { symbol: '1A0001', name: '上证指数', basePrice: 3089.26, volatility: 0.012, market: 'cn', category: 'Index' },
    { symbol: '399001', name: '深证成指', basePrice: 9512.42, volatility: 0.015, market: 'cn', category: 'Index' },
    { symbol: '399006', name: '创业板指', basePrice: 1862.15, volatility: 0.020, market: 'cn', category: 'Index' },
    { symbol: '510300', name: '沪深300ETF', basePrice: 3.892, volatility: 0.012, market: 'cn', category: 'ETF' },
    { symbol: '159915', name: '创业板ETF', basePrice: 1.624, volatility: 0.018, market: 'cn', category: 'ETF' },
    { symbol: '588000', name: '科创50ETF', basePrice: 0.892, volatility: 0.022, market: 'cn', category: 'ETF' },
    // --- 蓝筹 & 龙头 ---
    { symbol: '600519', name: '贵州茅台', basePrice: 1682.0, volatility: 0.012, market: 'cn', category: 'Main' },
    { symbol: '601318', name: '中国平安', basePrice: 48.82, volatility: 0.016, market: 'cn', category: 'Main' },
    { symbol: '000001', name: '平安银行', basePrice: 10.82, volatility: 0.020, market: 'cn', category: 'Main' },
    { symbol: '000333', name: '美的集团', basePrice: 52.18, volatility: 0.018, market: 'cn', category: 'Main' },
    { symbol: '000858', name: '五粮液', basePrice: 148.52, volatility: 0.015, market: 'cn', category: 'Main' },
    { symbol: '300750', name: '宁德时代', basePrice: 198.42, volatility: 0.025, market: 'cn', category: 'ChiNext' },
    { symbol: '688981', name: '中芯国际', basePrice: 68.42, volatility: 0.028, market: 'cn', category: 'STAR' },
    { symbol: '600900', name: '长江电力', basePrice: 28.92, volatility: 0.010, market: 'cn', category: 'Main' },
    { symbol: '601398', name: '工商银行', basePrice: 6.42, volatility: 0.012, market: 'cn', category: 'Main' },
    { symbol: '899050', name: '北证50指数', basePrice: 850.42, volatility: 0.025, market: 'cn', category: 'Index' },
  ],

  hk: [
    { symbol: 'HSI', name: '恒生指数', basePrice: 19842.5, volatility: 0.015, market: 'hk', category: 'Index' },
    { symbol: 'HSTECH', name: '恒生科技', basePrice: 4218.3, volatility: 0.022, market: 'hk', category: 'Index' },
    { symbol: '0700.HK', name: '腾讯控股', basePrice: 382.4, volatility: 0.018, market: 'hk' },
    { symbol: '9988.HK', name: '阿里巴巴-SW', basePrice: 84.65, volatility: 0.022, market: 'hk' },
    { symbol: '3690.HK', name: '美团-W', basePrice: 148.2, volatility: 0.025, market: 'hk' },
    { symbol: '1810.HK', name: '小米集团-W', basePrice: 22.85, volatility: 0.030, market: 'hk' },
    { symbol: '0941.HK', name: '中国移动', basePrice: 82.15, volatility: 0.012, market: 'hk' },
    { symbol: '2318.HK', name: '中国平安(HK)', basePrice: 42.85, volatility: 0.018, market: 'hk' },
  ],

  us: [
    { symbol: 'SPY', name: '标普500 ETF', basePrice: 589.42, volatility: 0.010, market: 'us', category: 'Index' },
    { symbol: 'QQQ', name: '纳指100 ETF', basePrice: 512.38, volatility: 0.013, market: 'us', category: 'Index' },
    { symbol: 'AAPL', name: '苹果', basePrice: 228.52, volatility: 0.015, market: 'us' },
    { symbol: 'MSFT', name: '微软', basePrice: 415.28, volatility: 0.014, market: 'us' },
    { symbol: 'NVDA', name: '英伟达', basePrice: 875.42, volatility: 0.028, market: 'us' },
    { symbol: 'TSLA', name: '特斯拉', basePrice: 248.52, volatility: 0.040, market: 'us' },
    { symbol: 'AMZN', name: '亚马逊', basePrice: 198.42, volatility: 0.018, market: 'us' },
    { symbol: 'BABA', name: '阿里巴巴(US)', basePrice: 88.52, volatility: 0.025, market: 'us' },
  ],

  crypto: [
    { symbol: 'BTCUSDT', name: '比特币', basePrice: 94820.0, volatility: 0.030, market: 'crypto' },
    { symbol: 'ETHUSDT', name: '以太坊', basePrice: 3284.5, volatility: 0.035, market: 'crypto' },
    { symbol: 'SOLUSDT', name: 'Solana', basePrice: 198.42, volatility: 0.045, market: 'crypto' },
    { symbol: 'BNBUSDT', name: '币安币', basePrice: 652.8, volatility: 0.028, market: 'crypto' },
    { symbol: 'XRPUSDT', name: '瑞波币', basePrice: 2.485, volatility: 0.040, market: 'crypto' },
    { symbol: 'DOGEUSDT', name: '狗狗币', basePrice: 0.182, volatility: 0.060, market: 'crypto' },
  ],

  commodities: [
    { symbol: 'XAUUSD', name: '现货黄金', basePrice: 2928.5, volatility: 0.008, market: 'commodities' },
    { symbol: 'WTIUSD', name: '美原油', basePrice: 72.84, volatility: 0.018, market: 'commodities' },
    { symbol: 'BRTUSD', name: '布伦特原油', basePrice: 76.92, volatility: 0.017, market: 'commodities' },
    { symbol: 'XAGUSD', name: '现货白银', basePrice: 32.42, volatility: 0.020, market: 'commodities' },
    { symbol: 'NGUSD', name: '天然气', basePrice: 2.842, volatility: 0.030, market: 'commodities' },
    { symbol: 'HGUSD', name: '铜期货', basePrice: 4.285, volatility: 0.015, market: 'commodities' },
  ],
};

// ============================================================
// 2. Logic Helpers (关键逻辑修正)
// ============================================================

/**
 * 转换 A 股代码为 API 可识别的后缀格式 (sh/sz/bj)
 */
export function formatCNSymbol(symbol: string): string {
  if (symbol === '1A0001') return 'sh000001';
  if (/^(60|68|51|58|11|000|000)/.test(symbol)) return `sh${symbol}`;
  if (/^(00|30|15|399|12|18)/.test(symbol)) return `sz${symbol}`;
  if (/^(8|4)/.test(symbol)) return `bj${symbol}`;
  return `sh${symbol}`;
}

/**
 * 获取默认启动展示的符号
 */
export const DEFAULT_SYMBOLS: Record<MarketType, string[]> = {
  fx: ['EURUSD', 'GBPUSD', 'USDJPY'],
  cn: ['1A0001', '510300', '300750'],
  hk: ['HSI', 'HSTECH', '0700.HK'],
  us: ['SPY', 'AAPL', 'NVDA'],
  crypto: ['BTCUSDT', 'ETHUSDT'],
  commodities: ['XAUUSD', 'WTIUSD'],
};

/**
 * 展平全量列表方便搜索
 */
export const ALL_SYMBOLS_FLAT = Object.values(ALL_MARKET_SYMBOLS).flat();

/**
 * 根据代码快速获取元数据信息
 */
export function getSymbolInfo(symbol: string): SymbolInfo | undefined {
  return ALL_SYMBOLS_FLAT.find(s => s.symbol === symbol);
}
