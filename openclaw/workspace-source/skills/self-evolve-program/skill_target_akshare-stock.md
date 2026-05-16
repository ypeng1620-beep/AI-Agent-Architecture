---
name: akshare-stock
description: Stock data fetching and analysis using akshare library. Provides functions for getting Chinese stock data, technical indicators, and fundamental analysis.
metadata:
  openclaw:
    emoji: "📈"
    homepage: https://github.com/ypeng1620/akshare-stock
    install:
      - id: "akshare-stock-scripts"
        kind: "local"
        label: "Scripts bundled with skill"
---

# akshare-stock Skill

Use the `akshare` Python library to fetch and analyze Chinese stock data.

## Quick Start

```bash
pip install akshare
```

### Basic Usage

```python
import akshare as ak

# Get stock daily data
df = ak.stock_zh_a_hist(symbol="000001", period="daily", start_date="20230101", end_date="20231231")

# Get real-time quote
df = ak.stock_zh_a_spot_em()
```

## Common Patterns

### 1. Daily K-Line Data

```python
import akshare as ak

def get_daily_data(symbol, start_date, end_date):
    """Fetch daily K-line data for a stock"""
    df = ak.stock_zh_a_hist(
        symbol=symbol,  # Stock code e.g. "000001"
        period="daily",
        start_date=start_date,  # Format: "YYYYMMDD"
        end_date=end_date
    )
    return df
```

### 2. Technical Indicators

```python
import akshare as ak

def get_technical_indicators(symbol):
    """Get common technical indicators"""
    # MACD
    df_macd = ak.stock_zh_a_hist(symbol=symbol, period="daily")
    # RSI, Bollinger Bands, etc. available via akshare
```

### 3. Fundamental Analysis

```python
import akshare as ak

def get_fundamental_data(symbol):
    """Get fundamental data"""
    # Financial reports
    df = ak.stock_financial_analysis_indicator(symbol=symbol)
    return df
```

## Troubleshooting

### Installation Issues

**Problem:** `ModuleNotFoundError: No module named 'akshare'`

**Solution:**
```bash
pip install akshare
```

### Data Fetch Issues

**Problem:** No data returned

**Solutions:**
1. Check if stock code is correct (include exchange suffix if needed)
2. Verify date range is valid
3. Check internet connection

### Common Stock Code Formats

| Exchange | Prefix | Example |
|----------|--------|---------|
| Shanghai | 600/601 | 600519 (Kweichow Moutai) |
| Shenzhen | 000/001 | 000001 (Ping An Bank) |
| GEM | 300 | 300750 (CATL) |
| STAR | 688 | 688005 (CATL) |

## Functions Reference

### Data Fetching

- `stock_zh_a_hist()` - Daily K-line data
- `stock_zh_a_spot_em()` - Real-time quotes
- `stock_zh_a_minute()` - Minute-level data
- `stock_financial_analysis_indicator()` - Financial indicators

### Technical Analysis

- `stock_zh_a_hist()` with indicator parameters

## See Also

- [akshare documentation](https://akshare.akfamily.xyz/)
- [tushare skill](../tushare) - Alternative data source
