# Multi-Market Live Monitor | 多市场实时监测平台

这是一个专业级多市场实时行情监测平台，采用「**Quant Terminal — 深海蓝黑专业量化终端**」风格设计，灵感来源于彭博终端与现代量化交易台。

## ✨ 线上访问 (Live Demo)

**https://multi-market-monitor-production.up.railway.app**

## 核心功能

- **六大市场覆盖**: 实时监控外汇 (FX)、A股 (CN)、港股 (HK)、美股 (US)、数字货币 (Crypto) 和大宗期货 (Commodities)。
- **专业 K 线图表**: 由 TradingView Lightweight Charts 强力驱动，支持多周期切换（5m, 15m, 1H, 4H, 1D）。
- **丰富技术指标**: 内置 MACD、RSI、布林带等常用技术指标。
- **高级缠论分析**: 自动绘制缠论笔、段、中枢，并识别三类买卖点。
- **实时信号引擎**: 右侧信号时间线实时推送超过 10 种交易信号，包括：
  - 布林带突破
  - RSI 超买/超卖反转
  - 波动率骤升
  - 关键位突破
  - 缠论三买候选/确认
- **信号中心**: 全局信号汇总视图，支持按市场、周期、信号类型过滤和排序。

## 技术架构

| 层次 | 技术栈 |
|---|---|
| **前端** | React 19, TypeScript, Vite, TailwindCSS, Lightweight Charts, Recharts, Framer Motion |
| **后端** | Node.js, Express.js, tRPC v11, tsx |
| **数据源** | Yahoo Finance, OKX API, 新浪财经 (Sina Finance) |
| **部署** | Docker, Railway.app (CI/CD via GitHub) |

## 部署

本项目通过 [Railway](https://railway.app) 平台实现自动化 CI/CD。任何推送到 `main` 分支的提交都会自动触发生产环境构建并部署到线上。
