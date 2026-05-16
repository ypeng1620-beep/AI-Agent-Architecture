import akshare as ak
import pandas as pd
from datetime import datetime

print(f'=== 盘中监控 {datetime.now().strftime("%H:%M")} ===')
print()

# 1. 主要指数 - 使用新浪源
try:
    idx = ak.stock_zh_index_spot_sina()
    major = idx[idx['代码'].isin(['sh000001','sz399001','sz399006','sh000688'])].copy()
    major['涨跌幅'] = major['涨跌幅'].astype(float)
    print('【主要指数】')
    for _, r in major.iterrows():
        sign = '+' if r['涨跌幅'] >= 0 else ''
        print(f"  {r['名称']}: {r['最新价']} {sign}{r['涨跌幅']:.2f}%")
    print()
except Exception as e:
    print(f'指数获取失败: {e}')
    print()

# 2. 涨跌家数 - 使用腾讯源
try:
    spot = ak.stock_zh_a_spot_tushare()
    up = len(spot[spot['pct_chg'] > 0])
    down = len(spot[spot['pct_chg'] < 0])
    flat = len(spot) - up - down
    total = len(spot)
    print(f'【市场概况】')
    print(f'  上涨: {up} ({up/total*100:.1f}%)')
    print(f'  下跌: {down} ({down/total*100:.1f}%)')
    print(f'  平盘: {flat}')
    print()
except Exception as e:
    print(f'市场概况获取失败(tushare): {e}')
    try:
        spot_em = ak.stock_zh_a_spot_em()
        up = len(spot_em[spot_em['涨跌幅'] > 0])
        down = len(spot_em[spot_em['涨跌幅'] < 0])
        flat = len(spot_em) - up - down
        total = len(spot_em)
        print(f'【市场概况(em)】')
        print(f'  上涨: {up} ({up/total*100:.1f}%)')
        print(f'  下跌: {down} ({down/total*100:.1f}%)')
        print(f'  平盘: {flat}')
        print()
    except Exception as e2:
        print(f'市场概况获取失败(em): {e2}')
    print()

# 3. 北向资金
try:
    print('【北向资金】')
    hk_hold = ak.stock_hsgt_north_hold_stock_em()
    north = ak.stock_hsgt_north_net_flow_in_em(indicator="北向资金")
    if len(north) > 0:
        latest = north.iloc[-1]
        print(f"  今日净流入: {latest['北向资金']:.2f}亿")
        print(f"  3日累计: {north['北向资金'].tail(3).sum():.2f}亿")
        print(f"  5日累计: {north['北向资金'].tail(5).sum():.2f}亿")
    print()
except Exception as e:
    print(f'北向资金获取失败: {e}')
    print()

# 4. 融资融券
try:
    print('【融资融券】')
    rzrq = ak.stock_margin_detail_szse(date=datetime.now().strftime('%Y%m%d'))
    if len(rzrq) > 0:
        print(f"  融资余额: {float(rzrq['融资余额'].iloc[-1])/1e8:.2f}亿")
    else:
        rzrq_yesterday = ak.stock_margin_detail_szse(date=(datetime.now().replace(day=1) - timedelta(days=1)).strftime('%Y%m%d'))
        if len(rzrq_yesterday) > 0:
            print(f"  融资余额(昨日): {float(rzrq_yesterday['融资余额'].iloc[-1])/1e8:.2f}亿")
    print()
except Exception as e:
    print(f'融资融券获取失败: {e}')
    print()

print('注: 部分数据源暂时不可用，请稍后重试')
