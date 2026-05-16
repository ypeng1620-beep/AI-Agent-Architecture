---
name: akshare-stock
description: Stock data fetching and analysis using akshare library. Provides functions for getting Chinese stock data, technical indicators, fundamental analysis, and backtesting.
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

Use the `akshare` Python library to fetch and analyze Chinese A-share stock data.

## Quick Reference

```python
import akshare as ak
from backtest_engine import run_backtest, sma_crossover_strategy

# Historical daily K-line
df = ak.stock_zh_a_hist(symbol="000001", period="daily", start_date="20230101", end_date="20231231")

# Real-time quotes (all A-shares)
spots = ak.stock_zh_a_spot_em()

# Backtest a strategy
results = run_backtest("000001", "20230101", "20231231", strategy=sma_crossover_strategy, short_window=20, long_window=50)
```

## Data Sources

### Stock Data

| Function | Description |
|----------|-------------|
| `stock_zh_a_hist()` | Daily/weekly/monthly K-line (primary) |
| `stock_zh_a_daily()` | Alternative daily OHLCV |
| `stock_zh_a_minute()` | Intraday minute-level data |
| `stock_zh_a_spot_em()` | Real-time quotes (all A-shares) |
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

## Strategies (backtest_engine.py)

The `backtest_engine` module provides three ready-made strategies plus support for custom ones:

```python
from backtest_engine import (
    run_backtest,
    sma_crossover_strategy,   # SMA dual crossover
    macd_strategy,           # MACD histogram crossover
    rsi_strategy,            # RSI threshold crossover
)
```

### sma_crossover_strategy

```python
# BUY when short SMA crosses above long SMA; SELL on reverse cross
signals = sma_crossover_strategy(df, short_window=20, long_window=50)
```

### macd_strategy

```python
# BUY when MACD histogram crosses from negative to positive; SELL on reverse
signals = macd_strategy(df, fast_period=12, slow_period=26, signal_period=9)
```

### rsi_strategy

```python
# BUY when RSI crosses above 30 (oversold); SELL when RSI crosses below 70 (overbought)
signals = rsi_strategy(df, period=14, oversold=30.0, overbought=70.0)
```

### Custom Strategy

```python
def my_strategy(df):
    """Must return: [{date, action: 'buy'|'sell'|'hold', price}]"""
    close_col = get_close_col(df)   # robust column detection
    # ... generate signals
    return signals

results = run_backtest("000001", "20230101", "20231231", strategy=my_strategy)
```

## DataFrame Column Detection

akshare functions return different Chinese column names across versions. Use the utility functions from `backtest_engine` to avoid hardcoding column names:

```python
from backtest_engine import (
    get_close_col,   # '收盘'
    get_open_col,   # '开盘'
    get_date_col,   # '日期'
    get_volume_col, # '成交量'
    get_high_col,   # '最高'
    get_low_col,    # '最低'
    get_pct_chg_col,# '涨跌幅'
)

close = df[get_close_col(df)]
```

## Pattern Library

### Robust Data Fetching (with retry)

```python
import time, logging
from backtest_engine import fetch_stock_data, AKSHARE_AVAILABLE

logger = logging.getLogger(__name__)

def get_with_retry(symbol, start, end, max_retries=3):
    """Fetch with exponential backoff on rate-limit errors."""
    if not AKSHARE_AVAILABLE:
        raise ImportError("pip install akshare")
    try:
        return fetch_stock_data(symbol, start, end, max_retries=max_retries)
    except Exception as e:
        logger.error(f"Failed after {max_retries} attempts: {e}")
        return pd.DataFrame()  # Return empty DataFrame instead of crashing
```

### Batch Fetching with Rate-Limit Respect

```python
import time
from backtest_engine import fetch_stock_data

def get_stocks_batch(symbols, start_date, end_date, delay=0.5):
    """Fetch multiple stocks with delay between requests.

    A-shares data sources (eastmoney) rate-limit at ~2-5 req/s.
    Use delay >= 0.5s between stocks to avoid 429 errors.
    """
    results = {}
    for symbol in symbols:
        try:
            df = fetch_stock_data(symbol, start_date, end_date)
            results[symbol] = df
            logger.info(f"✓ {symbol}: {len(df)} rows")
        except Exception as e:
            logger.warning(f"✗ {symbol}: {e}")
            results[symbol] = pd.DataFrame()
        time.sleep(delay)
    return results
```

### Caching

```python
import os, parquet
from backtest_engine import fetch_stock_data
from datetime import datetime

CACHE_DIR = os.path.expanduser("~/.stock_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

def get_cached(symbol, start, end, max_age_hours=24):
    key = f"{symbol}_{start}_{end}"
    path = os.path.join(CACHE_DIR, f"{key}.parquet")
    if os.path.exists(path):
        age_hours = (datetime.now().timestamp() - os.path.getmtime(path)) / 3600
        if age_hours < max_age_hours:
            return pd.read_parquet(path)
    df = fetch_stock_data(symbol, start, end)
    if not df.empty:
        df.to_parquet(path, index=False)
    return df
```

### Portfolio Comparison

```python
from backtest_engine import fetch_stock_data
import matplotlib.pyplot as plt

def compare_portfolio(symbols, start_date, end_date):
    """Overlay normalized price curves for multiple stocks."""
    plt.figure(figsize=(14, 6))
    for symbol in symbols:
        df = fetch_stock_data(symbol, start_date, end_date)
        if df.empty:
            continue
        close_col = get_close_col(df)
        normalized = df[close_col] / df[close_col].iloc[0] * 100
        date_col = get_date_col(df)
        plt.plot(df[date_col], normalized, label=symbol)
    plt.title("Normalized Price Comparison (Base=100)")
    plt.legend()
    plt.grid(True)
    plt.show()
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

### `FutureWarning` / dtype warnings

```python
# Convert specific columns after fetching
df['成交量'] = pd.to_numeric(df['成交量'], errors='coerce')
df['涨跌幅'] = pd.to_numeric(df['涨跌幅'], errors='coerce')
```

### Network timeout

```python
# Set a longer timeout via akshare's internal session
import akshare as ak
ak.session.proxies = {"http": "http://proxy:8080", "https": "http://proxy:8080"}
```

## Backtest Metrics Explained

| Metric | Description |
|--------|-------------|
| `total_return_pct` | Total return over the period (%) |
| `win_rate` | Percentage of profitable trades |
| `max_drawdown` | Largest peak-to-trough decline (%, lower = safer) |
| `sharpe_ratio` | Risk-adjusted return (>1 = good, >2 = excellent) |
| `avg_win / avg_loss` | Average profit/loss per winning/losing trade |

**Note:** Past performance ≠ future results. Backtest results are for informational/educational purposes only.

## See Also

- [akshare documentation](https://akshare.akfamily.xyz/)
- [tushare skill](../tushare) — Alternative data source with more granular financial data
