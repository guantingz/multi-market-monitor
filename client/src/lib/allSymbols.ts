// ============================================================
// Multi-Market Live Monitor — All Available Symbols
// Full tradeable symbol list for each market
// ============================================================

import type { MarketType } from './types';

export interface SymbolInfo {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
  market: MarketType;
}

export const ALL_MARKET_SYMBOLS: Record<MarketType, SymbolInfo[]> = {
  // ── 外汇 FX ── 全量主要/次要/交叉货币对
  fx: [
    // 主要货币对
    { symbol: 'EURUSD', name: 'Euro / US Dollar', basePrice: 1.0842, volatility: 0.003, market: 'fx' },
    { symbol: 'GBPUSD', name: 'British Pound / USD', basePrice: 1.2634, volatility: 0.004, market: 'fx' },
    { symbol: 'USDJPY', name: 'USD / Japanese Yen', basePrice: 149.82, volatility: 0.005, market: 'fx' },
    { symbol: 'AUDUSD', name: 'Australian Dollar / USD', basePrice: 0.6521, volatility: 0.005, market: 'fx' },
    { symbol: 'USDCAD', name: 'USD / Canadian Dollar', basePrice: 1.3612, volatility: 0.004, market: 'fx' },
    { symbol: 'USDCHF', name: 'USD / Swiss Franc', basePrice: 0.8942, volatility: 0.003, market: 'fx' },
    { symbol: 'NZDUSD', name: 'New Zealand Dollar / USD', basePrice: 0.6012, volatility: 0.005, market: 'fx' },
    // 人民币相关
    { symbol: 'USDCNH', name: 'USD / Chinese Yuan (Offshore)', basePrice: 7.2415, volatility: 0.002, market: 'fx' },
    { symbol: 'USDCNY', name: 'USD / Chinese Yuan (Onshore)', basePrice: 7.2380, volatility: 0.002, market: 'fx' },
    // 欧元交叉
    { symbol: 'EURGBP', name: 'Euro / British Pound', basePrice: 0.8582, volatility: 0.003, market: 'fx' },
    { symbol: 'EURJPY', name: 'Euro / Japanese Yen', basePrice: 162.45, volatility: 0.006, market: 'fx' },
    { symbol: 'EURAUD', name: 'Euro / Australian Dollar', basePrice: 1.6612, volatility: 0.005, market: 'fx' },
    { symbol: 'EURCAD', name: 'Euro / Canadian Dollar', basePrice: 1.4752, volatility: 0.004, market: 'fx' },
    { symbol: 'EURCHF', name: 'Euro / Swiss Franc', basePrice: 0.9682, volatility: 0.003, market: 'fx' },
    { symbol: 'EURNZD', name: 'Euro / New Zealand Dollar', basePrice: 1.8012, volatility: 0.005, market: 'fx' },
    // 英镑交叉
    { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', basePrice: 189.32, volatility: 0.007, market: 'fx' },
    { symbol: 'GBPAUD', name: 'British Pound / Australian Dollar', basePrice: 1.9382, volatility: 0.006, market: 'fx' },
    { symbol: 'GBPCAD', name: 'British Pound / Canadian Dollar', basePrice: 1.7212, volatility: 0.005, market: 'fx' },
    { symbol: 'GBPCHF', name: 'British Pound / Swiss Franc', basePrice: 1.1282, volatility: 0.004, market: 'fx' },
    { symbol: 'GBPNZD', name: 'British Pound / New Zealand Dollar', basePrice: 2.1012, volatility: 0.006, market: 'fx' },
    // 澳元交叉
    { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen', basePrice: 97.82, volatility: 0.006, market: 'fx' },
    { symbol: 'AUDCAD', name: 'Australian Dollar / Canadian Dollar', basePrice: 0.9012, volatility: 0.005, market: 'fx' },
    { symbol: 'AUDCHF', name: 'Australian Dollar / Swiss Franc', basePrice: 0.5842, volatility: 0.004, market: 'fx' },
    { symbol: 'AUDNZD', name: 'Australian Dollar / New Zealand Dollar', basePrice: 1.0882, volatility: 0.004, market: 'fx' },
    // 日元交叉
    { symbol: 'CADJPY', name: 'Canadian Dollar / Japanese Yen', basePrice: 110.12, volatility: 0.006, market: 'fx' },
    { symbol: 'CHFJPY', name: 'Swiss Franc / Japanese Yen', basePrice: 167.52, volatility: 0.006, market: 'fx' },
    { symbol: 'NZDJPY', name: 'New Zealand Dollar / Japanese Yen', basePrice: 90.12, volatility: 0.006, market: 'fx' },
    // 亚洲货币
    { symbol: 'USDHKD', name: 'USD / Hong Kong Dollar', basePrice: 7.8212, volatility: 0.001, market: 'fx' },
    { symbol: 'USDSGD', name: 'USD / Singapore Dollar', basePrice: 1.3412, volatility: 0.003, market: 'fx' },
    { symbol: 'USDINR', name: 'USD / Indian Rupee', basePrice: 83.42, volatility: 0.004, market: 'fx' },
    { symbol: 'USDKRW', name: 'USD / Korean Won', basePrice: 1325.0, volatility: 0.006, market: 'fx' },
    { symbol: 'USDTHB', name: 'USD / Thai Baht', basePrice: 35.42, volatility: 0.004, market: 'fx' },
    { symbol: 'USDMYR', name: 'USD / Malaysian Ringgit', basePrice: 4.712, volatility: 0.004, market: 'fx' },
    { symbol: 'USDIDR', name: 'USD / Indonesian Rupiah', basePrice: 15842.0, volatility: 0.005, market: 'fx' },
    { symbol: 'USDPHP', name: 'USD / Philippine Peso', basePrice: 56.42, volatility: 0.004, market: 'fx' },
    { symbol: 'USDTWD', name: 'USD / Taiwan Dollar', basePrice: 31.82, volatility: 0.003, market: 'fx' },
    // 新兴市场
    { symbol: 'USDBRL', name: 'USD / Brazilian Real', basePrice: 4.982, volatility: 0.010, market: 'fx' },
    { symbol: 'USDMXN', name: 'USD / Mexican Peso', basePrice: 17.12, volatility: 0.008, market: 'fx' },
    { symbol: 'USDZAR', name: 'USD / South African Rand', basePrice: 18.82, volatility: 0.012, market: 'fx' },
    { symbol: 'USDTRY', name: 'USD / Turkish Lira', basePrice: 32.42, volatility: 0.015, market: 'fx' },
    { symbol: 'USDRUB', name: 'USD / Russian Ruble', basePrice: 92.42, volatility: 0.020, market: 'fx' },
    { symbol: 'USDPLN', name: 'USD / Polish Zloty', basePrice: 4.012, volatility: 0.008, market: 'fx' },
    { symbol: 'USDSEK', name: 'USD / Swedish Krona', basePrice: 10.42, volatility: 0.006, market: 'fx' },
    { symbol: 'USDNOK', name: 'USD / Norwegian Krone', basePrice: 10.82, volatility: 0.007, market: 'fx' },
    { symbol: 'USDDKK', name: 'USD / Danish Krone', basePrice: 6.982, volatility: 0.003, market: 'fx' },
    { symbol: 'USDCZK', name: 'USD / Czech Koruna', basePrice: 23.42, volatility: 0.006, market: 'fx' },
    { symbol: 'USDHUF', name: 'USD / Hungarian Forint', basePrice: 362.5, volatility: 0.008, market: 'fx' },
    { symbol: 'USDRON', name: 'USD / Romanian Leu', basePrice: 4.682, volatility: 0.006, market: 'fx' },
    { symbol: 'USDILS', name: 'USD / Israeli Shekel', basePrice: 3.742, volatility: 0.006, market: 'fx' },
    { symbol: 'USDSAR', name: 'USD / Saudi Riyal', basePrice: 3.752, volatility: 0.001, market: 'fx' },
    { symbol: 'USDAED', name: 'USD / UAE Dirham', basePrice: 3.672, volatility: 0.001, market: 'fx' },
  ],

  // ── A股 CN ── 主要指数ETF + 沪深两市龙头股
  cn: [
    // 指数
    { symbol: '1A0001', name: '上证指数', basePrice: 3089.26, volatility: 0.012, market: 'cn' },
    { symbol: '399001', name: '深证成指', basePrice: 9842.5, volatility: 0.014, market: 'cn' },
    { symbol: '399006', name: '创业板指', basePrice: 1982.5, volatility: 0.018, market: 'cn' },
    { symbol: '000300', name: '沪深300', basePrice: 3842.5, volatility: 0.012, market: 'cn' },
    { symbol: '000905', name: '中证500', basePrice: 5482.5, volatility: 0.014, market: 'cn' },
    { symbol: '000852', name: '中证1000', basePrice: 5982.5, volatility: 0.016, market: 'cn' },
    // 宽基ETF
    { symbol: '510300', name: '沪深300ETF', basePrice: 3.892, volatility: 0.012, market: 'cn' },
    { symbol: '159915', name: '创业板ETF', basePrice: 1.624, volatility: 0.018, market: 'cn' },
    { symbol: '512500', name: '中证500ETF', basePrice: 5.218, volatility: 0.014, market: 'cn' },
    { symbol: '588000', name: '科创50ETF', basePrice: 0.892, volatility: 0.020, market: 'cn' },
    { symbol: '510050', name: '上证50ETF', basePrice: 2.682, volatility: 0.010, market: 'cn' },
    { symbol: '159922', name: '中证500ETF(易方达)', basePrice: 6.182, volatility: 0.014, market: 'cn' },
    { symbol: '512010', name: '医疗ETF', basePrice: 0.982, volatility: 0.018, market: 'cn' },
    { symbol: '512880', name: '证券ETF', basePrice: 0.982, volatility: 0.025, market: 'cn' },
    { symbol: '515050', name: '中概互联ETF', basePrice: 0.682, volatility: 0.028, market: 'cn' },
    // 金融
    { symbol: '600036', name: '招商银行', basePrice: 38.42, volatility: 0.015, market: 'cn' },
    { symbol: '601318', name: '中国平安', basePrice: 48.82, volatility: 0.016, market: 'cn' },
    { symbol: '601398', name: '工商银行', basePrice: 6.42, volatility: 0.012, market: 'cn' },
    { symbol: '601288', name: '农业银行', basePrice: 4.82, volatility: 0.012, market: 'cn' },
    { symbol: '601166', name: '兴业银行', basePrice: 18.42, volatility: 0.015, market: 'cn' },
    { symbol: '000001', name: '平安银行', basePrice: 10.82, volatility: 0.020, market: 'cn' },
    { symbol: '600000', name: '浦发银行', basePrice: 9.82, volatility: 0.018, market: 'cn' },
    { symbol: '601601', name: '中国太保', basePrice: 32.42, volatility: 0.016, market: 'cn' },
    { symbol: '601688', name: '华泰证券', basePrice: 18.82, volatility: 0.022, market: 'cn' },
    { symbol: '600030', name: '中信证券', basePrice: 22.42, volatility: 0.022, market: 'cn' },
    // 消费
    { symbol: '600519', name: '贵州茅台', basePrice: 1682.0, volatility: 0.012, market: 'cn' },
    { symbol: '000858', name: '五粮液', basePrice: 148.52, volatility: 0.015, market: 'cn' },
    { symbol: '000333', name: '美的集团', basePrice: 52.18, volatility: 0.018, market: 'cn' },
    { symbol: '000651', name: '格力电器', basePrice: 38.92, volatility: 0.016, market: 'cn' },
    { symbol: '603288', name: '海天味业', basePrice: 42.18, volatility: 0.018, market: 'cn' },
    { symbol: '600887', name: '伊利股份', basePrice: 28.42, volatility: 0.015, market: 'cn' },
    { symbol: '002304', name: '洋河股份', basePrice: 98.42, volatility: 0.016, market: 'cn' },
    { symbol: '600276', name: '恒瑞医药', basePrice: 42.82, volatility: 0.020, market: 'cn' },
    // 科技
    { symbol: '300750', name: '宁德时代', basePrice: 198.42, volatility: 0.025, market: 'cn' },
    { symbol: '688981', name: '中芯国际', basePrice: 68.42, volatility: 0.028, market: 'cn' },
    { symbol: '002415', name: '海康威视', basePrice: 32.42, volatility: 0.020, market: 'cn' },
    { symbol: '300059', name: '东方财富', basePrice: 18.82, volatility: 0.025, market: 'cn' },
    { symbol: '002230', name: '科大讯飞', basePrice: 42.82, volatility: 0.030, market: 'cn' },
    { symbol: '300014', name: '亿纬锂能', basePrice: 38.42, volatility: 0.028, market: 'cn' },
    { symbol: '002594', name: '比亚迪', basePrice: 282.42, volatility: 0.025, market: 'cn' },
    { symbol: '601127', name: '赛力斯', basePrice: 82.42, volatility: 0.035, market: 'cn' },
    // 能源/资源
    { symbol: '600900', name: '长江电力', basePrice: 28.92, volatility: 0.010, market: 'cn' },
    { symbol: '601857', name: '中国石油', basePrice: 8.92, volatility: 0.014, market: 'cn' },
    { symbol: '600028', name: '中国石化', basePrice: 6.82, volatility: 0.014, market: 'cn' },
    { symbol: '601088', name: '中国神华', basePrice: 38.42, volatility: 0.012, market: 'cn' },
    { symbol: '600585', name: '海螺水泥', basePrice: 28.42, volatility: 0.016, market: 'cn' },
    { symbol: '601899', name: '紫金矿业', basePrice: 18.42, volatility: 0.020, market: 'cn' },
    // 地产/建筑
    { symbol: '000002', name: '万科A', basePrice: 8.42, volatility: 0.025, market: 'cn' },
    { symbol: '600048', name: '保利发展', basePrice: 12.42, volatility: 0.022, market: 'cn' },
    { symbol: '601668', name: '中国建筑', basePrice: 5.82, volatility: 0.016, market: 'cn' },
    { symbol: '601800', name: '中国交建', basePrice: 8.42, volatility: 0.016, market: 'cn' },
  ],

  // ── 港股 HK ── 恒指成分股 + 主要中概股
  hk: [
    // 指数
    { symbol: 'HSI', name: '恒生指数', basePrice: 19842.5, volatility: 0.015, market: 'hk' },
    { symbol: 'HSTECH', name: '恒生科技指数', basePrice: 4218.3, volatility: 0.022, market: 'hk' },
    { symbol: 'HSCEI', name: '国企指数(H股)', basePrice: 6842.5, volatility: 0.016, market: 'hk' },
    // 科技互联网
    { symbol: '0700.HK', name: '腾讯控股', basePrice: 382.4, volatility: 0.018, market: 'hk' },
    { symbol: '9988.HK', name: '阿里巴巴-SW', basePrice: 84.65, volatility: 0.022, market: 'hk' },
    { symbol: '3690.HK', name: '美团-W', basePrice: 148.2, volatility: 0.025, market: 'hk' },
    { symbol: '9618.HK', name: '京东集团-SW', basePrice: 128.5, volatility: 0.025, market: 'hk' },
    { symbol: '9999.HK', name: '网易-S', basePrice: 148.8, volatility: 0.022, market: 'hk' },
    { symbol: '1810.HK', name: '小米集团-W', basePrice: 22.85, volatility: 0.030, market: 'hk' },
    { symbol: '9626.HK', name: '哔哩哔哩-SW', basePrice: 148.5, volatility: 0.035, market: 'hk' },
    { symbol: '0268.HK', name: '金蝶国际', basePrice: 8.42, volatility: 0.028, market: 'hk' },
    { symbol: '6690.HK', name: '海尔智家', basePrice: 22.42, volatility: 0.018, market: 'hk' },
    { symbol: '0992.HK', name: '联想集团', basePrice: 8.82, volatility: 0.022, market: 'hk' },
    { symbol: '0241.HK', name: '阿里健康', basePrice: 3.82, volatility: 0.030, market: 'hk' },
    { symbol: '0020.HK', name: '商汤集团-W', basePrice: 1.42, volatility: 0.045, market: 'hk' },
    // 金融
    { symbol: '0005.HK', name: '汇丰控股', basePrice: 68.45, volatility: 0.015, market: 'hk' },
    { symbol: '0388.HK', name: '香港交易所', basePrice: 318.6, volatility: 0.018, market: 'hk' },
    { symbol: '1299.HK', name: '友邦保险', basePrice: 58.25, volatility: 0.016, market: 'hk' },
    { symbol: '2318.HK', name: '中国平安', basePrice: 42.85, volatility: 0.018, market: 'hk' },
    { symbol: '1398.HK', name: '工商银行', basePrice: 5.42, volatility: 0.012, market: 'hk' },
    { symbol: '3988.HK', name: '中国银行', basePrice: 4.12, volatility: 0.012, market: 'hk' },
    { symbol: '2628.HK', name: '中国人寿', basePrice: 14.82, volatility: 0.016, market: 'hk' },
    { symbol: '0939.HK', name: '建设银行', basePrice: 6.42, volatility: 0.012, market: 'hk' },
    { symbol: '1288.HK', name: '农业银行', basePrice: 3.92, volatility: 0.012, market: 'hk' },
    { symbol: '2388.HK', name: '中银香港', basePrice: 28.42, volatility: 0.014, market: 'hk' },
    // 电信/能源
    { symbol: '0941.HK', name: '中国移动', basePrice: 82.15, volatility: 0.012, market: 'hk' },
    { symbol: '0762.HK', name: '中国联通', basePrice: 5.82, volatility: 0.018, market: 'hk' },
    { symbol: '0728.HK', name: '中国电信', basePrice: 4.42, volatility: 0.016, market: 'hk' },
    { symbol: '0883.HK', name: '中国海洋石油', basePrice: 18.42, volatility: 0.018, market: 'hk' },
    { symbol: '0857.HK', name: '中国石油股份', basePrice: 7.82, volatility: 0.016, market: 'hk' },
    { symbol: '0386.HK', name: '中国石油化工股份', basePrice: 5.42, volatility: 0.016, market: 'hk' },
    // 消费/医疗
    { symbol: '2382.HK', name: '舜宇光学科技', basePrice: 68.95, volatility: 0.028, market: 'hk' },
    { symbol: '0175.HK', name: '吉利汽车', basePrice: 10.82, volatility: 0.028, market: 'hk' },
    { symbol: '2020.HK', name: '安踏体育', basePrice: 82.42, volatility: 0.022, market: 'hk' },
    { symbol: '6862.HK', name: '海底捞', basePrice: 18.42, volatility: 0.025, market: 'hk' },
    { symbol: '1929.HK', name: '周大福', basePrice: 8.82, volatility: 0.020, market: 'hk' },
    { symbol: '1177.HK', name: '中国生物制药', basePrice: 3.82, volatility: 0.025, market: 'hk' },
    { symbol: '1093.HK', name: '石药集团', basePrice: 5.82, volatility: 0.022, market: 'hk' },
    { symbol: '2269.HK', name: '药明生物', basePrice: 18.42, volatility: 0.030, market: 'hk' },
    // 博彩/地产
    { symbol: '0027.HK', name: '银河娱乐', basePrice: 28.45, volatility: 0.025, market: 'hk' },
    { symbol: '1928.HK', name: '金沙中国', basePrice: 18.42, volatility: 0.025, market: 'hk' },
    { symbol: '0016.HK', name: '新鸿基地产', basePrice: 82.42, volatility: 0.016, market: 'hk' },
    { symbol: '0001.HK', name: '长和', basePrice: 42.42, volatility: 0.015, market: 'hk' },
    { symbol: '0002.HK', name: '中电控股', basePrice: 58.42, volatility: 0.012, market: 'hk' },
    { symbol: '0003.HK', name: '香港中华煤气', basePrice: 6.42, volatility: 0.012, market: 'hk' },
    { symbol: '0011.HK', name: '恒生银行', basePrice: 128.42, volatility: 0.014, market: 'hk' },
    { symbol: '0012.HK', name: '恒基地产', basePrice: 18.42, volatility: 0.016, market: 'hk' },
    { symbol: '0066.HK', name: '港铁公司', basePrice: 28.42, volatility: 0.012, market: 'hk' },
    { symbol: '0823.HK', name: '领展房产基金', basePrice: 38.42, volatility: 0.014, market: 'hk' },
    { symbol: '0101.HK', name: '恒隆地产', basePrice: 8.42, volatility: 0.018, market: 'hk' },
  ],

  // ── 美股 US ── S&P500 龙头 + 主要ETF + 中概ADR
  us: [
    // 主要指数ETF
    { symbol: 'SPY', name: 'S&P 500 ETF (SPDR)', basePrice: 589.42, volatility: 0.010, market: 'us' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF (Invesco)', basePrice: 512.38, volatility: 0.013, market: 'us' },
    { symbol: 'DIA', name: 'Dow Jones ETF (SPDR)', basePrice: 428.52, volatility: 0.009, market: 'us' },
    { symbol: 'IWM', name: 'Russell 2000 ETF (iShares)', basePrice: 228.52, volatility: 0.014, market: 'us' },
    { symbol: 'VTI', name: 'Total Market ETF (Vanguard)', basePrice: 282.52, volatility: 0.010, market: 'us' },
    { symbol: 'VOO', name: 'S&P 500 ETF (Vanguard)', basePrice: 542.52, volatility: 0.010, market: 'us' },
    // 科技七巨头
    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 228.52, volatility: 0.015, market: 'us' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 415.28, volatility: 0.014, market: 'us' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 875.42, volatility: 0.028, market: 'us' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 198.42, volatility: 0.018, market: 'us' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', basePrice: 178.52, volatility: 0.016, market: 'us' },
    { symbol: 'META', name: 'Meta Platforms Inc.', basePrice: 548.32, volatility: 0.022, market: 'us' },
    { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 248.52, volatility: 0.040, market: 'us' },
    // 其他科技
    { symbol: 'AMD', name: 'Advanced Micro Devices', basePrice: 168.42, volatility: 0.030, market: 'us' },
    { symbol: 'INTC', name: 'Intel Corp.', basePrice: 42.52, volatility: 0.025, market: 'us' },
    { symbol: 'AVGO', name: 'Broadcom Inc.', basePrice: 1682.52, volatility: 0.022, market: 'us' },
    { symbol: 'ORCL', name: 'Oracle Corp.', basePrice: 148.52, volatility: 0.018, market: 'us' },
    { symbol: 'CRM', name: 'Salesforce Inc.', basePrice: 282.52, volatility: 0.020, market: 'us' },
    { symbol: 'NFLX', name: 'Netflix Inc.', basePrice: 682.52, volatility: 0.025, market: 'us' },
    { symbol: 'ADBE', name: 'Adobe Inc.', basePrice: 482.52, volatility: 0.020, market: 'us' },
    { symbol: 'QCOM', name: 'Qualcomm Inc.', basePrice: 182.52, volatility: 0.022, market: 'us' },
    { symbol: 'TXN', name: 'Texas Instruments', basePrice: 182.52, volatility: 0.016, market: 'us' },
    { symbol: 'AMAT', name: 'Applied Materials', basePrice: 182.52, volatility: 0.025, market: 'us' },
    { symbol: 'MU', name: 'Micron Technology', basePrice: 112.52, volatility: 0.030, market: 'us' },
    { symbol: 'UBER', name: 'Uber Technologies', basePrice: 82.52, volatility: 0.028, market: 'us' },
    { symbol: 'PLTR', name: 'Palantir Technologies', basePrice: 28.52, volatility: 0.045, market: 'us' },
    // 金融
    { symbol: 'JPM', name: 'JPMorgan Chase', basePrice: 218.42, volatility: 0.016, market: 'us' },
    { symbol: 'BAC', name: 'Bank of America', basePrice: 42.52, volatility: 0.018, market: 'us' },
    { symbol: 'GS', name: 'Goldman Sachs', basePrice: 482.52, volatility: 0.018, market: 'us' },
    { symbol: 'MS', name: 'Morgan Stanley', basePrice: 112.52, volatility: 0.016, market: 'us' },
    { symbol: 'V', name: 'Visa Inc.', basePrice: 298.52, volatility: 0.012, market: 'us' },
    { symbol: 'MA', name: 'Mastercard Inc.', basePrice: 482.52, volatility: 0.012, market: 'us' },
    { symbol: 'BRK-B', name: 'Berkshire Hathaway B', basePrice: 448.82, volatility: 0.010, market: 'us' },
    { symbol: 'AXP', name: 'American Express', basePrice: 282.52, volatility: 0.016, market: 'us' },
    // 消费/零售
    { symbol: 'WMT', name: 'Walmart Inc.', basePrice: 88.52, volatility: 0.012, market: 'us' },
    { symbol: 'COST', name: 'Costco Wholesale', basePrice: 882.52, volatility: 0.012, market: 'us' },
    { symbol: 'HD', name: 'Home Depot', basePrice: 382.52, volatility: 0.014, market: 'us' },
    { symbol: 'MCD', name: "McDonald's Corp.", basePrice: 282.52, volatility: 0.012, market: 'us' },
    { symbol: 'SBUX', name: 'Starbucks Corp.', basePrice: 98.52, volatility: 0.018, market: 'us' },
    { symbol: 'NKE', name: 'Nike Inc.', basePrice: 82.52, volatility: 0.016, market: 'us' },
    // 医疗/制药
    { symbol: 'JNJ', name: 'Johnson & Johnson', basePrice: 158.42, volatility: 0.010, market: 'us' },
    { symbol: 'UNH', name: 'UnitedHealth Group', basePrice: 582.52, volatility: 0.014, market: 'us' },
    { symbol: 'PFE', name: 'Pfizer Inc.', basePrice: 28.52, volatility: 0.018, market: 'us' },
    { symbol: 'LLY', name: 'Eli Lilly and Co.', basePrice: 782.52, volatility: 0.022, market: 'us' },
    { symbol: 'ABBV', name: 'AbbVie Inc.', basePrice: 182.52, volatility: 0.016, market: 'us' },
    { symbol: 'MRK', name: 'Merck & Co.', basePrice: 128.52, volatility: 0.014, market: 'us' },
    // 能源
    { symbol: 'XOM', name: 'Exxon Mobil Corp.', basePrice: 118.42, volatility: 0.016, market: 'us' },
    { symbol: 'CVX', name: 'Chevron Corp.', basePrice: 158.52, volatility: 0.016, market: 'us' },
    // 商品ETF
    { symbol: 'GLD', name: 'Gold ETF (SPDR)', basePrice: 248.52, volatility: 0.008, market: 'us' },
    { symbol: 'SLV', name: 'Silver ETF (iShares)', basePrice: 28.52, volatility: 0.012, market: 'us' },
    { symbol: 'USO', name: 'Oil ETF (United States)', basePrice: 82.52, volatility: 0.020, market: 'us' },
    // 中概ADR
    { symbol: 'BABA', name: 'Alibaba Group ADR', basePrice: 88.52, volatility: 0.025, market: 'us' },
    { symbol: 'PDD', name: 'PDD Holdings ADR', basePrice: 148.52, volatility: 0.030, market: 'us' },
    { symbol: 'JD', name: 'JD.com ADR', basePrice: 42.52, volatility: 0.028, market: 'us' },
    { symbol: 'BIDU', name: 'Baidu Inc. ADR', basePrice: 98.52, volatility: 0.028, market: 'us' },
    { symbol: 'NIO', name: 'NIO Inc. ADR', basePrice: 5.82, volatility: 0.050, market: 'us' },
    { symbol: 'XPEV', name: 'XPeng Inc. ADR', basePrice: 12.52, volatility: 0.050, market: 'us' },
    { symbol: 'LI', name: 'Li Auto ADR', basePrice: 28.52, volatility: 0.045, market: 'us' },
  ],

  // ── 数字货币 Crypto ── 主流币 + DeFi + Layer2 + 新兴公链
  crypto: [
    // 主流
    { symbol: 'BTCUSDT', name: 'Bitcoin / USDT', basePrice: 94820.0, volatility: 0.030, market: 'crypto' },
    { symbol: 'ETHUSDT', name: 'Ethereum / USDT', basePrice: 3284.5, volatility: 0.035, market: 'crypto' },
    { symbol: 'BNBUSDT', name: 'BNB / USDT', basePrice: 652.8, volatility: 0.028, market: 'crypto' },
    { symbol: 'SOLUSDT', name: 'Solana / USDT', basePrice: 198.42, volatility: 0.045, market: 'crypto' },
    { symbol: 'XRPUSDT', name: 'XRP / USDT', basePrice: 2.485, volatility: 0.040, market: 'crypto' },
    { symbol: 'ADAUSDT', name: 'Cardano / USDT', basePrice: 0.582, volatility: 0.050, market: 'crypto' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin / USDT', basePrice: 0.182, volatility: 0.060, market: 'crypto' },
    { symbol: 'TRXUSDT', name: 'TRON / USDT', basePrice: 0.142, volatility: 0.040, market: 'crypto' },
    { symbol: 'TONUSDT', name: 'Toncoin / USDT', basePrice: 5.82, volatility: 0.045, market: 'crypto' },
    { symbol: 'SHIBUSDT', name: 'Shiba Inu / USDT', basePrice: 0.0000182, volatility: 0.070, market: 'crypto' },
    // Layer 1 公链
    { symbol: 'AVAXUSDT', name: 'Avalanche / USDT', basePrice: 38.42, volatility: 0.055, market: 'crypto' },
    { symbol: 'DOTUSDT', name: 'Polkadot / USDT', basePrice: 8.42, volatility: 0.050, market: 'crypto' },
    { symbol: 'ATOMUSDT', name: 'Cosmos / USDT', basePrice: 8.82, volatility: 0.050, market: 'crypto' },
    { symbol: 'NEARUSDT', name: 'NEAR Protocol / USDT', basePrice: 5.42, volatility: 0.055, market: 'crypto' },
    { symbol: 'APTUSDT', name: 'Aptos / USDT', basePrice: 8.82, volatility: 0.058, market: 'crypto' },
    { symbol: 'SUIUSDT', name: 'Sui / USDT', basePrice: 1.82, volatility: 0.060, market: 'crypto' },
    { symbol: 'ALGOUSDT', name: 'Algorand / USDT', basePrice: 0.182, volatility: 0.055, market: 'crypto' },
    { symbol: 'ICPUSDT', name: 'Internet Computer / USDT', basePrice: 12.42, volatility: 0.055, market: 'crypto' },
    { symbol: 'FTMUSDT', name: 'Fantom / USDT', basePrice: 0.682, volatility: 0.060, market: 'crypto' },
    { symbol: 'INJUSDT', name: 'Injective / USDT', basePrice: 28.42, volatility: 0.060, market: 'crypto' },
    // Layer 2
    { symbol: 'ARBUSDT', name: 'Arbitrum / USDT', basePrice: 1.42, volatility: 0.060, market: 'crypto' },
    { symbol: 'OPUSDT', name: 'Optimism / USDT', basePrice: 2.42, volatility: 0.060, market: 'crypto' },
    { symbol: 'MATICUSDT', name: 'Polygon / USDT', basePrice: 0.982, volatility: 0.055, market: 'crypto' },
    { symbol: 'STRKUSDT', name: 'Starknet / USDT', basePrice: 0.982, volatility: 0.065, market: 'crypto' },
    { symbol: 'ZKUSDT', name: 'zkSync / USDT', basePrice: 0.182, volatility: 0.065, market: 'crypto' },
    // DeFi
    { symbol: 'UNIUSDT', name: 'Uniswap / USDT', basePrice: 12.42, volatility: 0.052, market: 'crypto' },
    { symbol: 'LINKUSDT', name: 'Chainlink / USDT', basePrice: 18.42, volatility: 0.048, market: 'crypto' },
    { symbol: 'AAVEUSDT', name: 'Aave / USDT', basePrice: 182.42, volatility: 0.055, market: 'crypto' },
    { symbol: 'MKRUSDT', name: 'Maker / USDT', basePrice: 1682.42, volatility: 0.050, market: 'crypto' },
    { symbol: 'CRVUSDT', name: 'Curve DAO / USDT', basePrice: 0.582, volatility: 0.060, market: 'crypto' },
    { symbol: 'LDOUSDT', name: 'Lido DAO / USDT', basePrice: 2.42, volatility: 0.058, market: 'crypto' },
    { symbol: 'SNXUSDT', name: 'Synthetix / USDT', basePrice: 2.82, volatility: 0.060, market: 'crypto' },
    { symbol: 'COMPUSDT', name: 'Compound / USDT', basePrice: 82.42, volatility: 0.055, market: 'crypto' },
    // 传统币
    { symbol: 'LTCUSDT', name: 'Litecoin / USDT', basePrice: 98.42, volatility: 0.035, market: 'crypto' },
    { symbol: 'ETCUSDT', name: 'Ethereum Classic / USDT', basePrice: 28.42, volatility: 0.045, market: 'crypto' },
    { symbol: 'BCHUSDT', name: 'Bitcoin Cash / USDT', basePrice: 482.42, volatility: 0.040, market: 'crypto' },
    { symbol: 'XLMUSDT', name: 'Stellar / USDT', basePrice: 0.142, volatility: 0.050, market: 'crypto' },
    { symbol: 'VETUSDT', name: 'VeChain / USDT', basePrice: 0.042, volatility: 0.055, market: 'crypto' },
    { symbol: 'FILUSDT', name: 'Filecoin / USDT', basePrice: 6.82, volatility: 0.060, market: 'crypto' },
    // 新兴热点
    { symbol: 'PEPEUSDT', name: 'Pepe / USDT', basePrice: 0.0000182, volatility: 0.080, market: 'crypto' },
    { symbol: 'WIFUSDT', name: 'dogwifhat / USDT', basePrice: 2.82, volatility: 0.080, market: 'crypto' },
    { symbol: 'BONKUSDT', name: 'Bonk / USDT', basePrice: 0.0000282, volatility: 0.080, market: 'crypto' },
    { symbol: 'JUPUSDT', name: 'Jupiter / USDT', basePrice: 0.982, volatility: 0.070, market: 'crypto' },
    { symbol: 'RENDERUSDT', name: 'Render / USDT', basePrice: 8.42, volatility: 0.065, market: 'crypto' },
    { symbol: 'FETUSDT', name: 'Fetch.ai / USDT', basePrice: 1.82, volatility: 0.065, market: 'crypto' },
    { symbol: 'TAOUSDT', name: 'Bittensor / USDT', basePrice: 482.42, volatility: 0.070, market: 'crypto' },
    { symbol: 'WLDUSDT', name: 'Worldcoin / USDT', basePrice: 2.82, volatility: 0.070, market: 'crypto' },
    { symbol: 'SEIUSDT', name: 'Sei / USDT', basePrice: 0.482, volatility: 0.065, market: 'crypto' },
    { symbol: 'TIAUSDT', name: 'Celestia / USDT', basePrice: 8.42, volatility: 0.065, market: 'crypto' },
    { symbol: 'DYMUSDT', name: 'Dymension / USDT', basePrice: 2.82, volatility: 0.070, market: 'crypto' },
  ],

  // ── 大宗期货 Commodities ── 能源/金属/农产品/软商品
  commodities: [
    // 能源
    { symbol: 'WTIUSD', name: 'WTI 原油 (Crude Oil)', basePrice: 72.84, volatility: 0.018, market: 'commodities' },
    { symbol: 'BRTUSD', name: 'Brent 原油 (Brent Crude)', basePrice: 76.92, volatility: 0.017, market: 'commodities' },
    { symbol: 'NGUSD', name: '天然气 (Natural Gas)', basePrice: 2.842, volatility: 0.030, market: 'commodities' },
    { symbol: 'HHUSD', name: '取暖油 (Heating Oil)', basePrice: 2.482, volatility: 0.020, market: 'commodities' },
    { symbol: 'RBUSD', name: 'RBOB 汽油 (Gasoline)', basePrice: 2.282, volatility: 0.022, market: 'commodities' },
    { symbol: 'GASOILUSD', name: '瓦斯油 (Gas Oil)', basePrice: 782.5, volatility: 0.018, market: 'commodities' },
    { symbol: 'ETHANOLUSD', name: '乙醇 (Ethanol)', basePrice: 1.682, volatility: 0.025, market: 'commodities' },
    // 贵金属
    { symbol: 'XAUUSD', name: '现货黄金 (Gold Spot)', basePrice: 2928.5, volatility: 0.008, market: 'commodities' },
    { symbol: 'XAGUSD', name: '现货白银 (Silver Spot)', basePrice: 32.42, volatility: 0.020, market: 'commodities' },
    { symbol: 'XPTUSD', name: '铂金 (Platinum)', basePrice: 982.5, volatility: 0.018, market: 'commodities' },
    { symbol: 'XPDUSD', name: '钯金 (Palladium)', basePrice: 1082.5, volatility: 0.022, market: 'commodities' },
    { symbol: 'XRHUSD', name: '铑 (Rhodium)', basePrice: 4682.5, volatility: 0.030, market: 'commodities' },
    // 工业金属
    { symbol: 'HGUSD', name: '铜 (Copper)', basePrice: 4.285, volatility: 0.015, market: 'commodities' },
    { symbol: 'ALUSD', name: '铝 (Aluminum)', basePrice: 2282.5, volatility: 0.014, market: 'commodities' },
    { symbol: 'ZNUSD', name: '锌 (Zinc)', basePrice: 2682.5, volatility: 0.016, market: 'commodities' },
    { symbol: 'NIUSD', name: '镍 (Nickel)', basePrice: 16842.5, volatility: 0.022, market: 'commodities' },
    { symbol: 'PBUSD', name: '铅 (Lead)', basePrice: 2082.5, volatility: 0.016, market: 'commodities' },
    { symbol: 'SNUSD', name: '锡 (Tin)', basePrice: 28842.5, volatility: 0.020, market: 'commodities' },
    { symbol: 'CBUSD', name: '钴 (Cobalt)', basePrice: 32842.5, volatility: 0.025, market: 'commodities' },
    { symbol: 'LIUSD', name: '碳酸锂 (Lithium Carbonate)', basePrice: 12842.5, volatility: 0.030, market: 'commodities' },
    // 谷物/油料
    { symbol: 'CORNUSD', name: '玉米 (Corn)', basePrice: 448.5, volatility: 0.014, market: 'commodities' },
    { symbol: 'WHUSD', name: '小麦 (Wheat)', basePrice: 548.5, volatility: 0.016, market: 'commodities' },
    { symbol: 'SOYUSD', name: '大豆 (Soybeans)', basePrice: 985.4, volatility: 0.012, market: 'commodities' },
    { symbol: 'SOUSD', name: '豆油 (Soybean Oil)', basePrice: 48.42, volatility: 0.018, market: 'commodities' },
    { symbol: 'SMUSD', name: '豆粕 (Soybean Meal)', basePrice: 348.5, volatility: 0.016, market: 'commodities' },
    { symbol: 'RICEUSD', name: '大米 (Rice)', basePrice: 18.42, volatility: 0.014, market: 'commodities' },
    { symbol: 'OATUSD', name: '燕麦 (Oats)', basePrice: 382.5, volatility: 0.016, market: 'commodities' },
    { symbol: 'CANOLAUSD', name: '菜籽油 (Canola)', basePrice: 648.5, volatility: 0.014, market: 'commodities' },
    { symbol: 'PALMOILUSD', name: '棕榈油 (Palm Oil)', basePrice: 3982.5, volatility: 0.018, market: 'commodities' },
    // 软商品
    { symbol: 'CTUSD', name: '棉花 (Cotton)', basePrice: 82.42, volatility: 0.018, market: 'commodities' },
    { symbol: 'CCUSD', name: '可可 (Cocoa)', basePrice: 9842.5, volatility: 0.025, market: 'commodities' },
    { symbol: 'KCUSD', name: '咖啡 (Coffee)', basePrice: 248.5, volatility: 0.022, market: 'commodities' },
    { symbol: 'SBUSD', name: '糖 (Sugar)', basePrice: 18.42, volatility: 0.020, market: 'commodities' },
    { symbol: 'OJUSD', name: '橙汁 (Orange Juice)', basePrice: 382.5, volatility: 0.025, market: 'commodities' },
    { symbol: 'LBUSD', name: '木材 (Lumber)', basePrice: 548.5, volatility: 0.030, market: 'commodities' },
    { symbol: 'RUBUSD', name: '橡胶 (Rubber)', basePrice: 182.5, volatility: 0.022, market: 'commodities' },
    // 畜牧
    { symbol: 'LEUSD', name: '活牛 (Live Cattle)', basePrice: 188.5, volatility: 0.012, market: 'commodities' },
    { symbol: 'FCUSD', name: '饲养牛 (Feeder Cattle)', basePrice: 248.5, volatility: 0.014, market: 'commodities' },
    { symbol: 'HEUSD', name: '瘦肉猪 (Lean Hogs)', basePrice: 88.42, volatility: 0.018, market: 'commodities' },
    // 碳/其他
    { symbol: 'EUAUSD', name: '欧洲碳排放权 (EUA)', basePrice: 62.42, volatility: 0.025, market: 'commodities' },
    { symbol: 'URANIUSD', name: '铀 (Uranium)', basePrice: 98.42, volatility: 0.020, market: 'commodities' },
  ],
};

// Default symbols shown on startup (first 5 per market)
export const DEFAULT_SYMBOLS: Record<MarketType, string[]> = {
  fx: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCNH'],
  cn: ['1A0001', '510300', '159915', '512500', '588000'],
  hk: ['HSI', 'HSTECH', '0700.HK', '9988.HK', '3690.HK'],
  us: ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA'],
  crypto: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'],
  commodities: ['WTIUSD', 'BRTUSD', 'XAUUSD', 'HGUSD', 'SOYUSD'],
};
