---
name: akshare-stock
description: A股分析全能 Skill（实时行情、技术面、基本面、板块、衍生品与跨市场），基于 akshare + 自然语言路由
---

# A股分析全能 Skill

基于 AkShare 的 A股分析工具，提供股票筛选、个股深度分析、行业对比和估值计算功能。

## 功能

### 1. 实时行情
- A股实时涨跌幅
- 板块涨跌排行
- 资金流向

### 2. 技术面分析
- 移动平均线 (MA)
- 相对强弱指标 (RSI)
- MACD

### 3. 基本面分析
- 财务报表关键指标
- 市盈率、市净率
- 分红送转

### 4. 选股策略
- 低价股筛选
- 涨幅榜选股
- 资金流入选股

## 使用

```python
import akshare as ak

# 获取A股实时行情
df = ak.stock_zh_a_spot_em()

# 获取个股历史K线
df = ak.stock_zh_a_hist(symbol="000001", period="daily", start_date="20230101", end_date="20231231")
```

Note: Requires `pip install akshare`
