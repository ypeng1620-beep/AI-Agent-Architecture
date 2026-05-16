# -*- coding: utf-8 -*-
import akshare as ak
import pandas as pd
from datetime import datetime

print('=== 盘中监控 10:00 ===')
print(f'时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
print()

# 主流指数
print('【主流指数】')
try:
    df = ak.stock_zh_index_spot_em()
    indices = ['上证指数', '深证成指', '创业板指', '科创50', '沪深300']
    for idx in indices:
        row = df[df['名称'] == idx]
        if not row.empty:
            price = row['最新价'].values[0]
            chg = row['涨跌幅'].values[0]
            print(f"  {idx}: {price}  {'+' if chg >= 0 else ''}{chg}%")
except Exception as e:
    print(f'  获取失败: {e}')

# 港股
print()
print('【港股指数】')
try:
    df_hk = ak.stock_hk_spot_em()
    hk_indices = ['恒生指数', '恒生科技指数']
    for idx in hk_indices:
        row = df_hk[df_hk['名称'] == idx]
        if not row.empty:
            price = row['最新价'].values[0]
            chg = row['涨跌幅'].values[0]
            print(f"  {idx}: {price}  {'+' if chg >= 0 else ''}{chg}%")
        else:
            print(f"  {idx}: 未找到")
except Exception as e:
    print(f'  获取失败: {e}')

# 板块涨跌
print()
print('【行业板块涨跌前五】')
try:
    df = ak.stock_board_industry_name_em()
    df_sorted = df.sort_values('涨跌幅', ascending=False)
    print('  涨幅前五:')
    for _, r in df_sorted.head(5).iterrows():
        print(f"    {r['板块名称']}: +{r['涨跌幅']}%")
    print('  跌幅前五:')
    for _, r in df_sorted.tail(5).iterrows():
        print(f"    {r['板块名称']}: {r['涨跌幅']}%")
except Exception as e:
    print(f'  获取失败: {e}')

# 概念板块
print()
print('【概念板块涨幅前五】')
try:
    df = ak.stock_board_concept_name_em()
    df_sorted = df.sort_values('涨跌幅', ascending=False)
    for _, r in df_sorted.head(5).iterrows():
        print(f"    {r['板块名称']}: +{r['涨跌幅']}%")
except Exception as e:
    print(f'  获取失败: {e}')

# 成交额TOP
print()
print('【成交额前五】')
try:
    df = ak.stock_zh_a_spot_em()
    df_sorted = df.sort_values('成交额', ascending=False)
    for _, r in df_sorted.head(5).iterrows():
        name = r.get('名称', 'N/A')
        price = r.get('最新价', 'N/A')
        chg = r.get('涨跌幅', 0)
        turnover = r.get('成交额', 0) / 1e8
        print(f"    {name}: {price} {'+' if chg >= 0 else ''}{chg}% 成交额{turnover:.1f}亿")
except Exception as e:
    print(f'  获取失败: {e}')

# 北向资金
print()
print('【北向资金】')
try:
    df = ak.stock_em_hsgt_north_net_flow_in(indicator='北向资金')
    if not df.empty:
        latest = df.iloc[-1]
        print(f"  当日净买入: {latest.get('北向资金', 'N/A')} 亿元")
except Exception as e:
    print(f'  获取失败: {e}')
