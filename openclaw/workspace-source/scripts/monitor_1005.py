import akshare as ak
import pandas as pd
from datetime import datetime

print('=== 10:05 盘中监控 ===')
print(f'时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
print()

# 1. 沪深主要指数
try:
    index_df = ak.stock_zh_index_spot_em()
    major_indices = index_df[index_df['代码'].isin(['000001', '399001', '399006', '000688'])][['代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额']]
    print('【主要指数】')
    print(major_indices.to_string(index=False))
except Exception as e:
    print(f'指数数据获取失败: {e}')

print()

# 2. 今日涨跌统计
try:
    stat_df = ak.stock_zh_a_spot_em()
    up = len(stat_df[stat_df['涨跌幅'] > 0])
    down = len(stat_df[stat_df['涨跌幅'] < 0])
    flat = len(stat_df[stat_df['涨跌幅'] == 0])
    limit_up = len(stat_df[stat_df['涨跌幅'] >= 9.5])
    limit_down = len(stat_df[stat_df['涨跌幅'] <= -9.5])
    total_vol = stat_df['成交量'].sum() / 1e8  # 亿股
    total_amt = stat_df['成交额'].sum() / 1e8  # 亿元

    print('【市场概况】')
    print(f'上涨: {up} | 下跌: {down} | 平盘: {flat}')
    print(f'涨停: {limit_up} | 跌停: {limit_down}')
    print(f'总成交: {total_vol:.2f}亿股 / {total_amt:.2f}亿元')
except Exception as e:
    print(f'市场概况获取失败: {e}')

print()

# 3. 板块涨跌排行
try:
    sector_df = ak.stock_sector_spot(indicator='涨幅')
    top_sectors = sector_df.head(10)[['板块名称', '涨跌幅', '成交额']]
    print('【涨幅前10板块】')
    print(top_sectors.to_string(index=False))
except Exception as e:
    print(f'板块数据获取失败: {e}')

print()

# 4. 今日强势股
try:
    spot_df = ak.stock_zh_a_spot_em()
    strong = spot_df[spot_df['涨跌幅'] >= 5].sort_values('涨跌幅', ascending=False).head(5)[['代码', '名称', '最新价', '涨跌幅', '成交额']]
    print('【强势股 TOP5】(涨幅>=5%)')
    print(strong.to_string(index=False))
except Exception as e:
    print(f'强势股获取失败: {e}')

print()
print('=== 监控完成 ===')
