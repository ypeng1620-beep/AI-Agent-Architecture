#!/usr/bin/env python3
"""Optimize skills using OpenSpace MCP execute_task."""

import json
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

SKILL_DIRS = [
    r"C:\Users\ypeng\.openclaw\workspace\skills\akshare-stock",
    r"C:\Users\ypeng\.openclaw\workspace\skills\self-evolve-program",
    r"C:\Users\ypeng\.openclaw\workspace\skills\markitdown-skill",
]

TASKS = {
    "akshare-stock": """Optimize the akshare-stock skill:

1. ADD REAL BACKTESTING EVALUATION:
   - Add a backtest_engine.py module that implements a simple backtesting framework
   - The backtester should take a strategy function and historical data, then calculate:
     * Total return
     * Win rate (percentage of profitable trades)
     * Max drawdown
     * Sharpe ratio (risk-adjusted return)
   - Add a backtest_example.py showing how to use the framework with a simple moving average crossover strategy
   - Integrate the backtester into the skill so users can evaluate their strategies against historical data
   - Add proper error handling for cases where data is insufficient for backtesting

2. PRESERVE EXISTING:
   - All existing patterns (retry logic, caching, error handling)
   - Documentation structure
   - API reference

3. OUTPUT:
   - Create the optimized skill files in the skill directory
   - Report what was improved
""",
    "self-evolve-program": """Enhance the self-evolve-program skill:

1. ENHANCE THE EVALUATOR:
   - The current evaluator.js is too basic. Improve it to:
     * Support multiple metric types (accuracy, loss, latency, custom)
     * Add statistical significance testing between runs (t-test)
     * Add visualization of experiment results (plotly or chart.js)
     * Support parallel evaluation of multiple candidates
     * Add confidence intervals to scores
   
2. ADD AUTO-EVALUATION MODE:
   - Add an auto_eval.cjs script that:
     * Runs experiments in parallel (configurable parallelism)
     * Automatically collects metrics from experiment outputs
     * Performs statistical analysis to determine if improvements are real
     * Auto-stops if no improvement after N consecutive experiments (patience)
     * Generates evolution reports with charts
   
3. IMPROVE THE RUNNER:
   - Add support for experiment tags/categories
   - Add experiment serialization/resumption (save state, resume later)
   - Add resource monitoring (CPU, memory usage during experiments)
   
4. OUTPUT:
   - Enhance evaluator.cjs with the improvements
   - Create auto_eval.cjs
   - Create visualization components if needed
   - Report what was improved
""",
    "markitdown-skill": """Optimize the markitdown-skill:

1. OPTIMIZE batch_convert:
   - Current batch_convert.py processes files sequentially, which is slow
   - Optimize it to:
     * Use concurrent processing (ThreadPoolExecutor or multiprocessing)
     * Add a configurable max_workers parameter
     * Add progress tracking with ETA calculation
     * Add batch-level error handling (continue on individual file failure)
     * Add memory-efficient streaming for large file batches
     * Support glob patterns for input files
     * Add output directory creation if it doesn't exist
   
2. ADD PARALLEL CONVERSION:
   - Create parallel_convert.py that demonstrates high-performance batch conversion
   - Show performance comparison (sequential vs parallel)
   - Add rate limiting to avoid overwhelming the system
   
3. PRESERVE EXISTING:
   - Keep stream_convert.py for large single files
   - Keep all existing documentation
   
4. OUTPUT:
   - Optimize batch_convert.py with the improvements
   - Create parallel_convert.py
   - Report what was improved
"""
}

async def optimize_skill(skill_dir: str, task: str, skill_name: str):
    server_params = StdioServerParameters(
        command="C:\\Python314\\Scripts\\openspace-mcp.exe",
        args=["--transport", "stdio"],
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            print(f"\n{'='*60}")
            print(f"OPTIMIZING: {skill_name}")
            print(f"{'='*60}")
            
            # Execute the optimization task
            result = await session.call_tool(
                "execute_task",
                {
                    "task": task,
                    "workspace_dir": r"C:\Users\ypeng\.openclaw\workspace",
                    "skill_dirs": [skill_dir],
                    "max_iterations": 30,
                }
            )
            
            # Print the result
            if hasattr(result, 'content'):
                for content in result.content:
                    if hasattr(content, 'text'):
                        print(content.text)
            
            return result

async def main():
    results = {}
    
    for skill_name, task in TASKS.items():
        skill_dir = next((s for s in SKILL_DIRS if skill_name.lower() in s.lower()), None)
        if skill_dir:
            try:
                result = await optimize_skill(skill_dir, task, skill_name)
                results[skill_name] = {"status": "success", "result": result}
            except Exception as e:
                results[skill_name] = {"status": "error", "error": str(e)}
                print(f"Error optimizing {skill_name}: {e}")
        else:
            print(f"Skill directory not found for: {skill_name}")
            results[skill_name] = {"status": "error", "error": "Skill directory not found"}
    
    print(f"\n{'='*60}")
    print("OPTIMIZATION SUMMARY")
    print(f"{'='*60}")
    for skill_name, result in results.items():
        status = result.get("status", "unknown")
        print(f"  {skill_name}: {status.upper()}")

if __name__ == "__main__":
    asyncio.run(main())
