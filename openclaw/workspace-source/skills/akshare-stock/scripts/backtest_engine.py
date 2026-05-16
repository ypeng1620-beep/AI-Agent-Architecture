#!/usr/bin/env python3
"""
Backtesting Engine for akshare-stock skill

Provides real backtesting capabilities for evaluating trading strategies
against historical Chinese stock data.

Usage:
    from backtest_engine import run_backtest, Backtester, sma_crossover_strategy

    results = run_backtest("000001", "20230101", "20231231")
    print(results)
"""

import time
import logging
from dataclasses import dataclass, field
from typing import Optional, Callable, List, Dict, Any
from datetime import datetime
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Try to import akshare, handle if not installed
try:
    import akshare as ak
    AKSHARE_AVAILABLE = True
except ImportError:
    AKSHARE_AVAILABLE = False
    logger.warning("akshare not installed. pip install akshare to fetch stock data.")


# ─────────────────────────────────────────────────────────────────────────────
# Column Name Utilities
# ─────────────────────────────────────────────────────────────────────────────

def _detect_col(df: pd.DataFrame, *candidates: str) -> str:
    """
    Return the first column name in `candidates` that exists in df.columns.
    Handles both exact match and fuzzy match (lower-case).
    """
    col_lower = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand in df.columns:
            return cand
        if cand.lower() in col_lower:
            return col_lower[cand.lower()]
    # Fallback: search by keyword
    for cand in candidates:
        key = cand.lower()
        for col in df.columns:
            if key in col.lower():
                return col
    raise KeyError(f"None of {candidates} found in columns: {list(df.columns)}")


def get_close_col(df: pd.DataFrame) -> str:
    """Return the close price column name."""
    return _detect_col(df, '收盘', 'close', '收盘价')


def get_open_col(df: pd.DataFrame) -> str:
    """Return the open price column name."""
    return _detect_col(df, '开盘', 'open', '开盘价')


def get_date_col(df: pd.DataFrame) -> str:
    """Return the date column name."""
    return _detect_col(df, '日期', 'date', '交易日期')


def get_volume_col(df: pd.DataFrame) -> str:
    """Return the volume column name."""
    return _detect_col(df, '成交量', 'volume', '成交额')


def get_high_col(df: pd.DataFrame) -> str:
    """Return the high price column name."""
    return _detect_col(df, '最高', 'high', '最高价')


def get_low_col(df: pd.DataFrame) -> str:
    """Return the low price column name."""
    return _detect_col(df, '最低', 'low', '最低价')


def get_pct_chg_col(df: pd.DataFrame) -> str:
    """Return the percent-change column name."""
    return _detect_col(df, '涨跌幅', 'pct_chg', '涨跌幅(%)', '涨跌')


# ─────────────────────────────────────────────────────────────────────────────
# Data Models
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Trade:
    """Represents a single completed trade."""
    date: str
    symbol: str
    action: str  # 'buy' or 'sell'
    price: float
    quantity: int
    pnl: float = 0.0


@dataclass
class Position:
    """Represents an open position."""
    symbol: str
    entry_date: str
    entry_price: float
    quantity: int


@dataclass
class BacktestMetrics:
    """Results from a backtest run."""
    total_return: float
    total_return_pct: float
    win_rate: float
    max_drawdown: float
    sharpe_ratio: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    avg_win: float
    avg_loss: float
    avg_trade_return: float
    final_value: float
    initial_capital: float
    trades: List[Trade] = field(default_factory=list)

    def __str__(self):
        return (
            f"📊 Backtest Results\n"
            f"─────────────────────────────\n"
            f"💰 Return:     {self.total_return:+.2f} ({self.total_return_pct:+.2f}%)\n"
            f"📈 Win Rate:   {self.win_rate:.1%} ({self.winning_trades}/{self.total_trades} trades)\n"
            f"📉 Max DD:     {self.max_drawdown:.2%}\n"
            f"📊 Sharpe:     {self.sharpe_ratio:.2f}\n"
            f"💵 Final:      ¥{self.final_value:,.2f}\n"
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_return": self.total_return,
            "total_return_pct": self.total_return_pct,
            "win_rate": self.win_rate,
            "max_drawdown": self.max_drawdown,
            "sharpe_ratio": self.sharpe_ratio,
            "total_trades": self.total_trades,
            "winning_trades": self.winning_trades,
            "losing_trades": self.losing_trades,
            "avg_win": self.avg_win,
            "avg_loss": self.avg_loss,
            "avg_trade_return": self.avg_trade_return,
            "final_value": self.final_value,
            "initial_capital": self.initial_capital,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Backtester
# ─────────────────────────────────────────────────────────────────────────────

class Backtester:
    """
    Event-driven backtester for single-stock strategies.

    Supports:
        - A-shares commission (default: 0.03% + 0.001% stamp tax on sell)
        - Position sizing (minimum 100 shares = 1手)
        - Realistic portfolio tracking with drawdown / Sharpe metrics

    Args:
        initial_capital: Starting portfolio value in CNY (default: 100,000)
        commission: Commission rate per trade (default: 0.0003 = 0.03%)
        stamp_tax: Stamp tax rate on sell only (default: 0.001 = 0.1%)
    """

    def __init__(
        self,
        initial_capital: float = 100000.0,
        commission: float = 0.0003,
        stamp_tax: float = 0.001,
    ):
        self.initial_capital = initial_capital
        self.commission = commission
        self.stamp_tax = stamp_tax
        self.cash = initial_capital
        self.position: Optional[Position] = None
        self.positions: List[Position] = []
        self.trades: List[Trade] = []
        self.portfolio_history: List[float] = [initial_capital]
        self.dates: List[str] = []
        self._last_signal: Optional[str] = None  # 'buy' | 'sell' | 'hold'

    def buy(self, symbol: str, date: str, price: float, quantity: int) -> bool:
        """Execute a buy order (A股每手=100股)."""
        quantity = (quantity // 100) * 100  # Round down to nearest lot
        if quantity < 100:
            logger.warning(f"Quantity {quantity} < 100 shares (1手), skipped")
            return False
        cost = price * quantity * (1 + self.commission)
        if cost > self.cash:
            logger.warning(f"Insufficient cash: need ¥{cost:,.2f}, have ¥{self.cash:,.2f}")
            return False

        self.cash -= cost
        self.position = Position(symbol, date, price, quantity)
        self.positions.append(self.position)
        self._last_signal = 'buy'
        logger.debug(f"BUY {quantity} {symbol} @ ¥{price} on {date}")
        return True

    def sell(self, date: str, price: float) -> Optional[Trade]:
        """Execute a sell order (close position)."""
        if self.position is None:
            self._last_signal = 'sell'
            return None

        # A股印花税只在卖出时收取
        total_cost = price * self.position.quantity
        commission = total_cost * self.commission
        tax = total_cost * self.stamp_tax
        net_proceeds = total_cost - commission - tax
        pnl = net_proceeds - (self.position.entry_price * self.position.quantity)

        trade = Trade(
            date=date,
            symbol=self.position.symbol,
            action='sell',
            price=price,
            quantity=self.position.quantity,
            pnl=pnl,
        )
        self.trades.append(trade)
        self.cash += net_proceeds
        self.position = None
        self._last_signal = 'sell'
        logger.debug(f"SELL {trade.quantity} {trade.symbol} @ ¥{price} on {date}, P&L: ¥{pnl:,.2f}")
        return trade

    def update_value(self, date: str, current_price: float) -> float:
        """Record daily portfolio value for drawdown / Sharpe calculation."""
        self.dates.append(date)
        if self.position:
            value = self.cash + self.position.quantity * current_price
        else:
            value = self.cash
        self.portfolio_history.append(value)
        return value

    def hold(self):
        """Record a hold signal (no action)."""
        self._last_signal = 'hold'

    def calculate_metrics(self, risk_free_rate: float = 0.03) -> BacktestMetrics:
        """
        Calculate performance metrics from trade history.

        Args:
            risk_free_rate: Annual risk-free rate for Sharpe ratio (default 3%)

        Returns:
            BacktestMetrics object
        """
        if not self.trades:
            final_value = (
                self.cash
                if self.position is None
                else self.cash + self.position.quantity * self.position.entry_price
            )
            total_return = final_value - self.initial_capital
            return BacktestMetrics(
                total_return=total_return,
                total_return_pct=(total_return / self.initial_capital) * 100,
                win_rate=0.0,
                max_drawdown=0.0,
                sharpe_ratio=0.0,
                total_trades=0,
                winning_trades=0,
                losing_trades=0,
                avg_win=0.0,
                avg_loss=0.0,
                avg_trade_return=0.0,
                final_value=final_value,
                initial_capital=self.initial_capital,
            )

        pnls = [t.pnl for t in self.trades]
        winning_pnls = [p for p in pnls if p > 0]
        losing_pnls = [p for p in pnls if p <= 0]

        total_trades = len(self.trades)
        winning_trades = len(winning_pnls)
        losing_trades = len(losing_pnls)
        win_rate = winning_trades / total_trades if total_trades > 0 else 0.0

        avg_win = float(np.mean(winning_pnls)) if winning_pnls else 0.0
        avg_loss = float(np.mean(losing_pnls)) if losing_pnls else 0.0
        avg_trade_return = float(np.mean(pnls)) if pnls else 0.0

        final_value = self.cash
        if self.position:
            final_value += self.position.quantity * self.position.entry_price

        total_return = final_value - self.initial_capital
        total_return_pct = (total_return / self.initial_capital) * 100

        # Max drawdown on portfolio equity curve
        portfolio_arr = np.array(self.portfolio_history)
        running_max = np.maximum.accumulate(portfolio_arr)
        drawdowns = (running_max - portfolio_arr) / running_max
        max_drawdown = float(np.max(drawdowns)) if len(drawdowns) > 0 else 0.0

        # Annualised Sharpe ratio (daily returns)
        if len(portfolio_arr) > 2:
            daily_returns = np.diff(portfolio_arr) / portfolio_arr[:-1]
            # Annualise: 252 trading days, subtract risk-free daily rate
            daily_rf = risk_free_rate / 252
            excess_returns = daily_returns - daily_rf
            std_excess = np.std(excess_returns, ddof=1)
            if std_excess > 1e-10:
                sharpe_ratio = (
                    np.mean(excess_returns) / std_excess * np.sqrt(252)
                )
            else:
                sharpe_ratio = 0.0
        else:
            sharpe_ratio = 0.0

        return BacktestMetrics(
            total_return=total_return,
            total_return_pct=total_return_pct,
            win_rate=win_rate,
            max_drawdown=max_drawdown,
            sharpe_ratio=sharpe_ratio,
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            avg_win=avg_win,
            avg_loss=avg_loss,
            avg_trade_return=avg_trade_return,
            final_value=final_value,
            initial_capital=self.initial_capital,
            trades=self.trades,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Strategy Helpers (low-level signal generators)
# ─────────────────────────────────────────────────────────────────────────────

def sma_crossover_strategy(
    df: pd.DataFrame,
    short_window: int = 20,
    long_window: int = 50,
    price_col: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Simple Moving Average Crossover Strategy.

    Signal logic (vectorized):
        - BUY:  short_sma crosses above long_sma
        - SELL: short_sma crosses below long_sma
        - HOLD: otherwise

    Args:
        df: DataFrame with price data
        short_window: Short SMA period (default: 20)
        long_window: Long SMA period (default: 50)
        price_col: Name of the close price column (auto-detected if None)

    Returns:
        List of {date, action: 'buy'|'sell'|'hold', price}
    """
    if price_col is None:
        price_col = get_close_col(df)

    if len(df) < long_window:
        raise ValueError(f"Need at least {long_window} days of data, got {len(df)}")

    df = df.copy()
    df['_sma_s'] = df[price_col].rolling(window=short_window, min_periods=short_window).mean()
    df['_sma_l'] = df[price_col].rolling(window=long_window, min_periods=long_window).mean()

    # Vectorized crossover detection
    df['_sig'] = 0
    df.loc[df['_sma_s'] > df['_sma_l'], '_sig'] = 1
    df.loc[df['_sma_s'] <= df['_sma_l'], '_sig'] = -1

    df['_prev_sig'] = df['_sig'].shift(1).fillna(0).astype(int)

    date_col = get_date_col(df)

    signals = []
    for _, row in df.iterrows():
        if pd.isna(row['_sma_s']) or pd.isna(row['_sma_l']):
            signals.append({'date': str(row[date_col]), 'action': 'hold', 'price': row[price_col]})
            continue

        s, ps = int(row['_sig']), int(row['_prev_sig'])
        if s == 1 and ps == -1:
            action = 'buy'
        elif s == -1 and ps == 1:
            action = 'sell'
        else:
            action = 'hold'

        signals.append({'date': str(row[date_col]), 'action': action, 'price': row[price_col]})

    return signals


def macd_strategy(
    df: pd.DataFrame,
    fast_period: int = 12,
    slow_period: int = 26,
    signal_period: int = 9,
    price_col: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    MACD Strategy (Moving Average Convergence Divergence).

    Signal logic:
        - BUY:  MACD histogram crosses from negative to positive (divergence ends)
        - SELL: MACD histogram crosses from positive to negative (convergence starts)
        - HOLD: otherwise

    Args:
        df: DataFrame with price data
        fast_period: Fast EMA period (default: 12)
        slow_period: Slow EMA period (default: 26)
        signal_period: Signal line period (default: 9)
        price_col: Name of the close price column (auto-detected if None)

    Returns:
        List of {date, action: 'buy'|'sell'|'hold', price}
    """
    if price_col is None:
        price_col = get_close_col(df)

    if len(df) < slow_period + signal_period:
        raise ValueError(f"Need at least {slow_period + signal_period} days of data")

    df = df.copy()

    exp_fast = df[price_col].ewm(span=fast_period, adjust=False).mean()
    exp_slow = df[price_col].ewm(span=slow_period, adjust=False).mean()
    macd_line = exp_fast - exp_slow
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
    histogram = macd_line - signal_line

    df['_macd_hist'] = histogram
    df['_prev_hist'] = histogram.shift(1)

    date_col = get_date_col(df)

    signals = []
    for _, row in df.iterrows():
        if pd.isna(row['_macd_hist']) or pd.isna(row['_prev_hist']):
            signals.append({'date': str(row[date_col]), 'action': 'hold', 'price': row[price_col]})
            continue

        h, ph = row['_macd_hist'], row['_prev_hist']
        if ph <= 0 and h > 0:
            action = 'buy'
        elif ph >= 0 and h < 0:
            action = 'sell'
        else:
            action = 'hold'

        signals.append({'date': str(row[date_col]), 'action': action, 'price': row[price_col]})

    return signals


def rsi_strategy(
    df: pd.DataFrame,
    period: int = 14,
    oversold: float = 30.0,
    overbought: float = 70.0,
    price_col: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    RSI (Relative Strength Index) Strategy.

    Signal logic:
        - BUY:  RSI crosses above oversold threshold (30)
        - SELL: RSI crosses below overbought threshold (70)
        - HOLD: otherwise

    Args:
        df: DataFrame with price data
        period: RSI period (default: 14)
        oversold: Buy threshold (default: 30)
        overbought: Sell threshold (default: 70)
        price_col: Name of the close price column (auto-detected if None)

    Returns:
        List of {date, action: 'buy'|'sell'|'hold', price}
    """
    if price_col is None:
        price_col = get_close_col(df)

    if len(df) < period + 1:
        raise ValueError(f"Need at least {period + 1} days of data")

    df = df.copy()

    delta = df[price_col].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    df['_rsi'] = rsi
    df['_prev_rsi'] = rsi.shift(1)

    date_col = get_date_col(df)

    signals = []
    for _, row in df.iterrows():
        if pd.isna(row['_rsi']) or pd.isna(row['_prev_rsi']):
            signals.append({'date': str(row[date_col]), 'action': 'hold', 'price': row[price_col]})
            continue

        r, pr = row['_rsi'], row['_prev_rsi']
        if pr <= oversold and r > oversold:
            action = 'buy'
        elif pr >= overbought and r < overbought:
            action = 'sell'
        else:
            action = 'hold'

        signals.append({'date': str(row[date_col]), 'action': action, 'price': row[price_col]})

    return signals


# ─────────────────────────────────────────────────────────────────────────────
# Data Fetching
# ─────────────────────────────────────────────────────────────────────────────

def fetch_stock_data(
    symbol: str,
    start_date: str,
    end_date: str,
    max_retries: int = 3,
    delay: float = 1.0,
) -> pd.DataFrame:
    """
    Fetch daily K-line data from akshare with retry + exponential backoff.

    Args:
        symbol: Stock code (e.g., "000001")
        start_date: Start date in YYYYMMDD format
        end_date: End date in YYYYMMDD format
        max_retries: Number of retry attempts on failure
        delay: Base delay in seconds between retries

    Returns:
        DataFrame with stock price data

    Raises:
        ImportError: If akshare is not installed
        RuntimeError: If all retry attempts fail
    """
    if not AKSHARE_AVAILABLE:
        raise ImportError("akshare not installed. Run: pip install akshare")

    last_error: Optional[Exception] = None
    for attempt in range(max_retries):
        try:
            df = ak.stock_zh_a_hist(
                symbol=symbol,
                period="daily",
                start_date=start_date,
                end_date=end_date,
            )
            return df
        except Exception as e:
            last_error = e
            err_str = str(e).lower()
            if any(kw in err_str for kw in ['rate', 'limit', 'frequency', '429', 'too many']):
                wait = min(delay * (2 ** attempt), 60.0)
                logger.warning(f"Rate limited {symbol}, retry {attempt + 1}/{max_retries} in {wait:.1f}s")
                time.sleep(wait)
            else:
                # Non-rate-limit error: log and re-raise immediately
                logger.error(f"Non-retryable error fetching {symbol}: {e}")
                raise

    raise RuntimeError(f"Failed to fetch {symbol} after {max_retries} attempts: {last_error}")


# ─────────────────────────────────────────────────────────────────────────────
# High-Level Backtest Runner
# ─────────────────────────────────────────────────────────────────────────────

def run_backtest(
    symbol: str,
    start_date: str,
    end_date: str,
    strategy: Callable = sma_crossover_strategy,
    initial_capital: float = 100000.0,
    verbose: bool = True,
    **strategy_kwargs,
) -> BacktestMetrics:
    """
    Run a complete backtest for a given stock and strategy.

    Args:
        symbol: Stock code (e.g., "000001")
        start_date: Start date in YYYYMMDD format
        end_date: End date in YYYYMMDD format
        strategy: Signal generator function, e.g. sma_crossover_strategy
                  Signature: func(df, **kwargs) -> List[{date, action, price}]
        initial_capital: Starting capital in CNY
        verbose: Print progress and results
        **strategy_kwargs: Passed through to the strategy function

    Returns:
        BacktestMetrics object

    Example:
        >>> results = run_backtest("000001", "20230101", "20231231",
        ...                        strategy=sma_crossover_strategy,
        ...                        short_window=20, long_window=50)
        >>> print(results)
    """
    if verbose:
        print(f"🔍 Fetching data for {symbol}...")

    df = fetch_stock_data(symbol, start_date, end_date)
    if df is None or df.empty:
        raise ValueError(f"No data returned for {symbol}")

    if verbose:
        close_col = get_close_col(df)
        print(f"   Got {len(df)} days of data, date range: {df[get_date_col(df)].iloc[0]} → {df[get_date_col(df)].iloc[-1]}")

    signals = strategy(df, **strategy_kwargs)
    buy_signals = [s for s in signals if s['action'] == 'buy']
    sell_signals = [s for s in signals if s['action'] == 'sell']

    if verbose:
        print(f"📈 Signals: {len(buy_signals)} buys, {len(sell_signals)} sells")

    backtester = Backtester(initial_capital=initial_capital)

    for signal in signals:
        if signal['action'] == 'buy' and backtester.position is None:
            price = signal['price']
            # Max shares we can afford (including commission buffer)
            max_qty = int(backtester.cash / (price * 1.005))
            quantity = (max_qty // 100) * 100
            if quantity >= 100:
                backtester.buy(symbol, signal['date'], price, quantity)

        elif signal['action'] == 'sell' and backtester.position is not None:
            backtester.sell(signal['date'], signal['price'])

        else:
            backtester.hold()

        # Update equity curve
        backtester.update_value(signal['date'], signal['price'])

    metrics = backtester.calculate_metrics()
    if verbose:
        print(metrics)

    return metrics


# ─────────────────────────────────────────────────────────────────────────────
# CLI Entry Point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    """CLI usage: python backtest_engine.py <symbol> <start> <end> [options]"""
    import argparse

    parser = argparse.ArgumentParser(description="Backtest a Chinese stock strategy")
    parser.add_argument("symbol", help="Stock code (e.g. 000001)")
    parser.add_argument("start_date", help="Start date (YYYYMMDD)")
    parser.add_argument("end_date", help="End date (YYYYMMDD)")
    parser.add_argument("--capital", type=float, default=100000, help="Initial capital (default: 100000)")
    parser.add_argument(
        "--strategy", choices=["sma", "macd", "rsi"], default="sma",
        help="Strategy to use (default: sma)"
    )
    parser.add_argument("--short", type=int, default=20, help="Short window (default: 20)")
    parser.add_argument("--long", type=int, default=50, help="Long window (default: 50)")
    parser.add_argument("--period", type=int, default=14, help="RSI period (default: 14)")

    args = parser.parse_args()

    strategy_map = {
        'sma': (sma_crossover_strategy, {'short_window': args.short, 'long_window': args.long}),
        'macd': (macd_strategy, {}),
        'rsi': (rsi_strategy, {'period': args.period}),
    }

    strat_fn, strat_kwargs = strategy_map[args.strategy]

    print(f"\n{'=' * 50}")
    print(f"Backtesting {args.symbol}  {args.start_date} → {args.end_date}")
    print(f"Strategy: {args.strategy.upper()}, Capital: ¥{args.capital:,.0f}")
    print(f"{'=' * 50}\n")

    try:
        run_backtest(
            symbol=args.symbol,
            start_date=args.start_date,
            end_date=args.end_date,
            strategy=strat_fn,
            initial_capital=args.capital,
            verbose=True,
            **strat_kwargs,
        )
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()
