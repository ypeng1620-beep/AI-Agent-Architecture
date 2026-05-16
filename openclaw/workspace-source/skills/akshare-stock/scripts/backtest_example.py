#!/usr/bin/env python3
"""
Backtest Example for akshare-stock skill

This script demonstrates how to use the backtesting engine with
Chinese stock data from akshare.

Run: python backtest_example.py
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backtest_engine import (
    run_backtest,
    sma_crossover_strategy,
    macd_strategy,
    Backtester,
    fetch_stock_data,
)


def example_000001():
    """
    Example: Backtest SMA crossover strategy on 平安银行 (Ping An Bank, 000001)
    Period: 2023-01-01 to 2023-12-31
    """
    print("\n" + "=" * 60)
    print("Example 1: SMA Crossover on 000001 (Ping An Bank)")
    print("=" * 60)
    
    results = run_backtest(
        symbol="000001",      # Ping An Bank
        start_date="20230101",
        end_date="20231231",
        strategy=sma_crossover_strategy,
        initial_capital=100000,
        short_window=20,
        long_window=50,
        verbose=True
    )
    return results


def example_600519():
    """
    Example: Backtest MACD strategy on 贵州茅台 (Kweichow Moutai, 600519)
    Period: 2022-01-01 to 2023-12-31
    """
    print("\n" + "=" * 60)
    print("Example 2: MACD Strategy on 600519 (Kweichow Moutai)")
    print("=" * 60)
    
    results = run_backtest(
        symbol="600519",      # Kweichow Moutai
        start_date="20220101",
        end_date="20231231",
        strategy=macd_strategy,
        initial_capital=200000,  # Higher capital for expensive stock
        verbose=True
    )
    return results


def example_compare_strategies():
    """
    Example: Compare SMA vs MACD on the same stock
    """
    print("\n" + "=" * 60)
    print("Example 3: Compare SMA vs MACD on 000858 (Wuliangye)")
    print("=" * 60)
    
    symbol = "000858"
    start = "20220101"
    end = "20231231"
    
    print("\n--- SMA Crossover (20/50) ---")
    sma_results = run_backtest(
        symbol=symbol,
        start_date=start,
        end_date=end,
        strategy=sma_crossover_strategy,
        initial_capital=100000,
        verbose=True
    )
    
    print("\n--- MACD ---")
    macd_results = run_backtest(
        symbol=symbol,
        start_date=start,
        end_date=end,
        strategy=macd_strategy,
        initial_capital=100000,
        verbose=True
    )
    
    print("\n" + "=" * 40)
    print("📊 Comparison Summary")
    print("=" * 40)
    print(f"{'Metric':<20} {'SMA':>15} {'MACD':>15}")
    print("-" * 50)
    print(f"{'Return %':<20} {sma_results.total_return_pct:>+15.2f} {macd_results.total_return_pct:>+15.2f}")
    print(f"{'Win Rate':<20} {sma_results.win_rate:>15.1%} {macd_results.win_rate:>15.1%}")
    print(f"{'Sharpe Ratio':<20} {sma_results.sharpe_ratio:>15.2f} {macd_results.sharpe_ratio:>15.2f}")
    print(f"{'Max Drawdown':<20} {sma_results.max_drawdown:>15.2%} {macd_results.max_drawdown:>15.2%}")
    print(f"{'Total Trades':<20} {sma_results.total_trades:>15} {macd_results.total_trades:>15}")
    
    return sma_results, macd_results


def example_custom_strategy():
    """
    Example: Using a custom strategy function
    """
    print("\n" + "=" * 60)
    print("Example 4: Custom Strategy (Buy & Hold Baseline)")
    print("=" * 60)
    
    def buy_and_hold(df):
        """Generate buy at start, sell at end signals."""
        if len(df) < 2:
            return []
        return [
            {'date': str(df.iloc[0]['日期']), 'action': 'buy', 'price': df.iloc[0]['收盘']},
            {'date': str(df.iloc[-1]['日期']), 'action': 'sell', 'price': df.iloc[-1]['收盘']},
        ]
    
    results = run_backtest(
        symbol="000001",
        start_date="20210101",
        end_date="20231231",  # 3 year hold
        strategy=buy_and_hold,
        initial_capital=100000,
        verbose=True
    )
    return results


def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║         akshare-stock Backtesting Engine Examples             ║
╚══════════════════════════════════════════════════════════════╝

This script demonstrates the backtesting capabilities added to
the akshare-stock skill.

Available examples:
  1. SMA Crossover on 000001 (Ping An Bank)
  2. MACD Strategy on 600519 (Kweichow Moutai)
  3. Compare SMA vs MACD strategies
  4. Custom Strategy (Buy & Hold baseline)

Note: These are educational examples, not financial advice.
Past performance does not guarantee future results.
    """)
    
    # Run all examples
    try:
        example_000001()
    except Exception as e:
        print(f"❌ Example 1 failed: {e}")
    
    try:
        example_600519()
    except Exception as e:
        print(f"❌ Example 2 failed: {e}")
    
    try:
        example_compare_strategies()
    except Exception as e:
        print(f"❌ Example 3 failed: {e}")
    
    try:
        example_custom_strategy()
    except Exception as e:
        print(f"❌ Example 4 failed: {e}")
    
    print("\n" + "=" * 60)
    print("All examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
