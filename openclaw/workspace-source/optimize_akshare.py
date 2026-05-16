#!/usr/bin/env python3
"""Optimize akshare-stock skill with real backtesting using OpenSpace MCP."""

import json
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(
        command="C:\\Python314\\Scripts\\openspace-mcp.exe",
        args=["--transport", "stdio"],
    )
    
    task = """Add a REAL BACKTESTING ENGINE to the akshare-stock skill:

Create a new file: scripts/backtest_engine.py

The backtest engine should:

1. IMPLEMENT A SIMPLE BACKTESTER CLASS:
```python
class Backtester:
    def __init__(self, initial_capital=100000):
        self.initial_capital = initial_capital
        self.positions = []  # {symbol, entry_date, entry_price, quantity}
        self.trades = []     # {date, symbol, action, price, quantity, pnl}
        self.portfolio_value = initial_capital
        
    def add_position(self, symbol, date, price, quantity):
        # Add a buy position
        
    def close_position(self, symbol, date, price):
        # Close a position and record P&L
        
    def calculate_metrics(self):
        # Return: total_return, win_rate, max_drawdown, sharpe_ratio
```

2. IMPLEMENT A SIMPLE SMA CROSSOVER STRATEGY:
```python
def sma_crossover_strategy(df, short_window=20, long_window=50):
    # df needs: date, open, high, low, close columns (from akshare)
    # Returns: list of {date, action: 'buy'|'sell'|'hold', price}
```

3. ADD RUN_BACKTEST FUNCTION:
```python
def run_backtest(symbol, start_date, end_date, strategy=sma_crossover_strategy):
    # 1. Fetch data using akshare
    # 2. Run strategy to generate signals
    # 3. Execute backtest
    # 4. Return metrics
```

4. ERROR HANDLING:
- Handle insufficient data (less than long_window days)
- Handle API errors with retry logic
- Handle empty results

5. SAVE TO:
   C:\\Users\\ypeng\\.openclaw\\workspace\\skills\\akshare-stock\\scripts\\backtest_engine.py

6. UPDATE SKILL.md to document the new backtesting capability

7. ALSO CREATE: scripts/backtest_example.py showing usage with 000001 (平安银行) stock

Report what was created/added.
"""

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            print("=" * 60)
            print("OPTIMIZING: akshare-stock (Adding Real Backtesting)")
            print("=" * 60)
            
            result = await session.call_tool(
                "execute_task",
                {
                    "task": task,
                    "workspace_dir": r"C:\Users\ypeng\.openclaw\workspace",
                    "skill_dirs": [r"C:\Users\ypeng\.openclaw\workspace\skills\akshare-stock"],
                    "max_iterations": 25,
                }
            )
            
            for content in result.content:
                if hasattr(content, 'text'):
                    print(content.text)

if __name__ == "__main__":
    asyncio.run(main())
