---
name: akshare
description: Chinese financial data access using AkShare library. Fetch real-time and historical data for A-shares, Hong Kong stocks, US stocks, futures, funds, and macroeconomic indicators.
---

# AkShare Skill

Access Chinese financial data via AkShare library.

## Tools

Use Python to call akshare functions:
- Stock quotes (实时行情)
- Historical data (历史数据)
- Futures market data (期货市场)
- Fund information (基金信息)
- Macroeconomic indicators (宏观经济)

## Quick Start

```python
import akshare as ak

# Get A-share real-time quotes (all stocks)
df = ak.stock_zh_a_spot_em()

# Get daily K-line data
df = ak.stock_zh_a_hist(symbol="000001", period="daily", start_date="20230101", end_date="20231231")

# Get futures data
df = ak.futures_zh_daily_sina(symbol="CU")

# Get fund NAV
df = ak.fund_open_fund_daily_em()
```

Note: Requires `pip install akshare`

## Data Sources

### Stock Data

| Function | Description |
|----------|-------------|
| `stock_zh_a_spot_em()` | A-share real-time quotes (all stocks) |
| `stock_zh_a_hist()` | Daily/weekly/monthly K-line data |
| `stock_zh_a_daily()` | Alternative daily OHLCV |
| `stock_zh_a_minute()` | Intraday minute-level data |
| `stock_zh_a_new()` | Newly listed stocks (次新股) |
| `stock_zh_a_tick_ansi()` | Tick data (raw) |
| `stock_financial_analysis_indicator()` | Financial indicators |
| `stock_financial_report_sina()` | Financial reports (Sina) |

### Fund Data

| Function | Description |
|----------|-------------|
| `fund_open_fund_daily_em()` | Open-end fund NAV (eastmoney) |
| `fund_etf_hist_sina()` | ETF historical data (Sina) |
| `fund_etf_fund_info()` | ETF basic info |

### Futures Data

| Function | Description |
|----------|-------------|
| `futures_zh_daily_sina()` | Chinese futures daily K-line (Sina) |
| `futures_global_commodity_sina()` | Global commodity futures |

### Macro / Economic

| Function | Description |
|----------|-------------|
| `macro_china_money_supply()` | Money supply (M0/M1/M2) |
| `macro_china_cpi()` | CPI data |
| `bond_china_yield()` | China bond yields |

## Common Stock Codes

| Exchange | Prefix | Example | Company |
|----------|--------|---------|---------|
| Shanghai | 600/601 | 600519 | Kweichow Moutai |
| Shanghai | 601 | 601318 | Ping An Insurance |
| Shenzhen | 000 | 000001 | Ping An Bank |
| Shenzhen | 000 | 000858 | Wuliangye Yibin |
| GEM | 300 | 300750 | CATL |
| GEM | 300 | 300015 | Aier Eye Hospital |
| STAR | 688 | 688005 | CNLOG |
| STAR | 688 | 688981 | SMIC |

## Common Patterns

### Robust Data Fetching (with retry)

```python
import time
import akshare as ak

def fetch_with_retry(func, *args, max_retries=3, delay=1, **kwargs):
    """Fetch with exponential backoff on rate-limit errors."""
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait = delay * (2 ** attempt)
            print(f"Attempt {attempt+1} failed: {e}. Retrying in {wait}s...")
            time.sleep(wait)
```

### Batch Fetching with Rate-Limit Respect

```python
import time
import akshare as ak

def get_stocks_batch(symbols, start_date, end_date, delay=0.5):
    """Fetch multiple stocks with delay between requests.

    A-shares data sources (eastmoney) rate-limit at ~2-5 req/s.
    Use delay >= 0.5s between stocks to avoid 429 errors.
    """
    results = {}
    for symbol in symbols:
        try:
            df = ak.stock_zh_a_hist(symbol=symbol, period="daily",
                                   start_date=start_date, end_date=end_date)
            results[symbol] = df
            print(f"✓ {symbol}: {len(df)} rows")
        except Exception as e:
            print(f"✗ {symbol}: {e}")
            results[symbol] = None
        time.sleep(delay)
    return results
```

### Caching

```python
import os
import pandas as pd
from datetime import datetime

CACHE_DIR = os.path.expanduser("~/.akshare_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

def get_cached(symbol, start, end, max_age_hours=24):
    """Get data from cache if fresh, otherwise fetch and cache."""
    cache_file = os.path.join(CACHE_DIR, f"{symbol}_{start}_{end}.parquet")
    if os.path.exists(cache_file):
        age_hours = (datetime.now().timestamp() - os.path.getmtime(cache_file)) / 3600
        if age_hours < max_age_hours:
            return pd.read_parquet(cache_file)
    df = ak.stock_zh_a_hist(symbol=symbol, period="daily",
                           start_date=start, end_date=end)
    if df is not None and not df.empty:
        df.to_parquet(cache_file, index=False)
    return df
```

### Column Detection (akshare v2 compatibility)

```python
import akshare as ak

def get_ohlcv(df):
    """Detect akshare column names robustly across versions."""
    close = next((c for c in df.columns if '收盘' in c or 'close' in c.lower()), None)
    open_col = next((c for c in df.columns if '开盘' in c or 'open' in c.lower()), None)
    high = next((c for c in df.columns if '最高' in c or 'high' in c.lower()), None)
    low = next((c for c in df.columns if '最低' in c or 'low' in c.lower()), None)
    volume = next((c for c in df.columns if '成交量' in c or 'volume' in c.lower()), None)
    return open_col, high, low, close, volume
```

## Troubleshooting

### `ModuleNotFoundError: No module named 'akshare'`

```bash
pip install akshare
```

### `RequestFrequencyLimitError` / HTTP 429

akshare's data sources (eastmoney) rate-limit at ~2-5 requests/second.

Solutions:
1. Add `time.sleep(delay)` between batch requests (≥ 0.5s)
2. Use caching to avoid redundant API calls
3. Reduce date range or number of stocks per query

### No data returned / empty DataFrame

1. Verify stock code is correct (include exchange prefix if needed)
2. Check date range is valid (avoid future dates)
3. Some stocks may not have data for certain periods (e.g., newly listed)

### Network timeout

```python
# Set a longer timeout via akshare's internal session
import akshare as ak
ak.session.proxies = {"http": "http://proxy:8080", "https": "http://proxy:8080"}
```

## See Also

- [akshare documentation](https://akshare.akfamily.xyz/)
- [akshare-stock skill](../akshare-stock) — Stock-specific optimization with backtesting
- [tushare skill](../tushare) — Alternative data source with more granular financial data
