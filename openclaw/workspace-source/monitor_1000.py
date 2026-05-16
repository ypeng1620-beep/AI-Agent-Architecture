# -*- coding: utf-8 -*-
import akshare as ak
import pandas as pd
from datetime import datetime

print("=== 大盘监控 10:00 ===")
print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# 大盘指数
print("【大盘指数】")
indices = [
    ("sh000001", "上证指数"),
    ("sz399001", "深证成指"),
    ("sz399006", "创业板指"),
    ("sh000300", "沪深300"),
    ("sh000016", "上证50"),
    ("sh000688", "科创50"),
]
for code, name in indices:
    try:
        df = ak.stock_zh_index_spot_em(symbol=code)
        price = float(df.iloc[0]["最新价"])
        chg = float(df.iloc[0]["涨跌幅"])
        print(f"  {name}: {price:.2f} ({chg:+.2f}%)")
    except Exception as e:
        print(f"  {name}: 获取失败 {e}")

print()
# 两市涨跌统计
print("【两市概况】")
try:
    df = ak.stock_zh_a_spot_em()
    up = (df["涨跌幅"] > 0).sum()
    down = (df["涨跌幅"] < 0).sum()
    flat = (df["涨跌幅"] == 0).sum()
    total = len(df)
    limit_up = (df["涨跌幅"] >= 9.5).sum()
    limit_down = (df["涨跌幅"] <= -9.5).sum()
    print(f"  上涨: {up} | 下跌: {down} | 平盘: {flat} | 涨停: {limit_up} | 跌停: {limit_down}")
    print(f"  總計: {total} 只")
except Exception as e:
    print(f"  获取失败: {e}")

print()
# 自选股监控
print("【自选股】")
try:
    df = ak.stock_zh_a_spot_em()
    # 过滤沪、深股
    my_stocks = ["601868", "003035"]
    for code in my_stocks:
        row = df[df["代码"] == code]
        if len(row) > 0:
            r = row.iloc[0]
            name = r["名称"]
            price = float(r["最新价"])
            chg = float(r["涨跌幅"])
            print(f"  {name}({code}): {price} ({chg:+.2f}%)")
        else:
            print(f"  {code}: 未找到")
except Exception as e:
    print(f"  获取失败: {e}")

print()
# 板块涨跌前5
print("【板块涨幅前5】")
try:
    df = ak.stock_board_industry_name_em()
    df_sorted = df.sort_values("涨跌幅", ascending=False).head(5)
    for _, row in df_sorted.iterrows():
        print(f"  {row['板块名称']}: {row['涨跌幅']:+.2f}%")
except Exception as e:
    print(f"  获取失败: {e}")

print()
print("【板块跌幅前5】")
try:
    df = ak.stock_board_industry_name_em()
    df_sorted = df.sort_values("涨跌幅", ascending=True).head(5)
    for _, row in df_sorted.iterrows():
        print(f"  {row['板块名称']}: {row['涨跌幅']:+.2f}%")
except Exception as e:
    print(f"  获取失败: {e}")

print()
print("=== 监控完成 ===")
