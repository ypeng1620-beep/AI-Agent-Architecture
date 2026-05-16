---
name: public-apis-finance
description: Finance相关免费API集合，包含46个API。
triggers:
  - "需要Finance数据"
  - "调用FinanceAPI"
---

# Finance API集合

## 概述
收录46个Finance相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请
- **OAuth**: 需要认证

## 常用API
### SEC EDGAR Data
```bash
curl -s "https://www.sec.gov/edgar/sec-api-documentation"
```
### Econdb
```bash
curl -s "https://www.econdb.com/api/"
```
### Portfolio Optimizer
```bash
curl -s "https://portfoliooptimizer.io/"
```
### Binlist
```bash
curl -s "https://binlist.net/"
```
### Indian Mutual Fund
```bash
curl -s "https://www.mfapi.in/"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| FRED | apiKey | Yes | Yes | 经济数据 |
| SEC EDGAR Data | No | Yes | Yes | 美国公司年报 |
| Econdb | No | Yes | Yes | 全球宏观经济数据 |
| Portfolio Optimizer | No | Yes | Yes | 投资组合优化 |
| Hotstoks | apiKey | Yes | Yes | 股票市场数据 |
| IEX Cloud | apiKey | Yes | Yes | 股票市场数据 |
| Yahoo Finance | apiKey | Yes | Yes | 股票加密货币外汇 |
| Alpha Vantage | apiKey | Yes | Unknown | 实时股票数据 |
| Finnhub | apiKey | Yes | Unknown | 股票货币加密 |
| Financial Modeling Prep | apiKey | Yes | Unknown | 股票数据 |
| Alpaca | apiKey | Yes | Yes | 股票市场数据 |
| Polygon | apiKey | Yes | Unknown | 历史股票数据 |
| Twelve Data | apiKey | Yes | Unknown | 股票市场数据 |
| Marketstack | apiKey | Yes | Unknown | 实时股票数据 |
| StockData | apiKey | Yes | Yes | 股票数据情绪 |
| Styvio | apiKey | Yes | Unknown | 股票数据情绪 |
| Finage | apiKey | Yes | Unknown | 股票加密指数 |
| Tradier | OAuth | Yes | Yes | 美国股票期权市场 |
| Intrinio | apiKey | Yes | Unknown | 金融数据 |
| OpenFIGI | apiKey | Yes | Yes | 股票符号 |
| Plaid | apiKey | Yes | Unknown | 连接银行账户 |
| Nordigen | apiKey | Yes | Unknown | 银行账户连接 |
| YNAB | OAuth | Yes | Yes | 预算 |
| Zoho Books | OAuth | Yes | Unknown | 在线会计 |
| Klarna | apiKey | Yes | Unknown | Klarna支付 |
| MercadoPago | apiKey | Yes | Unknown | Mercado Pago |
| Billplz | apiKey | Yes | Unknown | 支付平台 |
| Binlist | No | Yes | Unknown | IIN BIN数据库 |
| VAT Validation | apiKey | Yes | Yes | 验证VAT号 |
| Tax Data API | apiKey | Yes | Unknown | VAT验证 |
| Banco do Brasil | OAuth | Yes | Yes | 金融API |
| Front Accounting | OAuth | Yes | Yes | 小企业会计 |
| IG | apiKey | Yes | Unknown | 价差赌注CFD |
| Mono | apiKey | Yes | Unknown | 非洲银行账户 |
| Moov | apiKey | Yes | Unknown | 汇款 |
| Indian Mutual Fund | No | Yes | Unknown | 印度共同基金 |
| Razorpay IFSC | No | Yes | Unknown | 印度IFSC代码 |
| Real Time Finance | apiKey | No | Unknown | websocket股票数据 |
| Aletheia | apiKey | Yes | Yes | 内幕交易数据 |
| Bank Data API | apiKey | Yes | Unknown | IBAN SWIFT验证 |
| Boleto.Cloud | apiKey | Yes | Unknown | 巴西票据生成 |
| Citi | apiKey | Yes | Unknown | 花旗API |
| Fed Treasury | No | Yes | Unknown | 美国财政部数据 |
| WallstreetBets | No | Yes | Unknown | WSB情绪分析 |
| SmartAPI | apiKey | Yes | Unknown | 经纪服务 |
| CollegeFootballData | apiKey | Yes | Unknown | 美国大学足球 |
