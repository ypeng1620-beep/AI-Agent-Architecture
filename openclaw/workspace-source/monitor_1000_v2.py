# -*- coding: utf-8 -*-
import requests
import json
from datetime import datetime

print("=== 盘中监控 10:00 ===")
print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

headers = {'User-Agent': 'Mozilla/5.0'}

# 指数
print("【大盘指数】")
indices = [
    ('sh000001', '上证指数'),
    ('sz399001', '深证成指'),
    ('sz399006', '创业板指'),
    ('sh000300', '沪深300'),
    ('sh000016', '上证50'),
    ('sh000688', '科创50'),
]
for code, name in indices:
    try:
        url = f'http://hq.sinajs.cn/list={code}'
        r = requests.get(url, headers=headers, timeout=5)
        data = r.text
        parts = data.split('"')[1].split(',')
        price = float(parts[1])
        pct = float(parts[3])
        print(f"  {name}: {price:.2f} ({pct:+.2f}%)")
    except Exception as e:
        print(f"  {name}: 获取失败")

print()
# 自选股
print("【自选股】")
my_stocks = [
    ('sh601868', '中国电建'),
    ('sz003035', '瑞玛精密'),
]
for code, name in my_stocks:
    try:
        url = f'http://hq.sinajs.cn/list={code}'
        r = requests.get(url, headers=headers, timeout=5)
        data = r.text
        parts = data.split('"')[1].split(',')
        price = float(parts[1])
        pct = float(parts[3])
        print(f"  {name}({code}): {price} ({pct:+.2f}%)")
    except Exception as e:
        print(f"  {name}: 获取失败")

print()
print("=== 监控完成 ===")
