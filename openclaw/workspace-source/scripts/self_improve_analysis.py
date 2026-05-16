#!/usr/bin/env python3
import sys
sys.path.insert(0, 'C:/Users/ypeng/.openclaw/workspace/skills/xiucheng-self-improving-agent')

from self_improving import SelfImprovingAgent
from datetime import datetime

sia = SelfImprovingAgent(workspace='C:/Users/ypeng/.openclaw/workspace')

# Check stats
stats = sia.get_improvement_stats()
print('=== Current Stats ===')
for k, v in stats.items():
    print(f'  {k}: {v}')

# Suggest SOUL updates
print('\n=== SOUL.md Suggestions ===')
suggestions = sia.suggest_soul_updates()
for s in suggestions:
    print(f'  - {s}')

# Log tonight's improvement insights based on today's memory
print('\n=== Logging improvements ===')

# Insight 1: Main session auto-compression worked
sia.log_improvement(
    "Main session自动压缩机制有效，tokens从61%降至12%，无需人工干预",
    category="system"
)

# Insight 2: Cron job self-evolve running smoothly
sia.log_improvement(
    "自我进化cron任务(cheng_an_self_evolve_bg)已持续稳定运行，15次迭代均正常",
    category="stability"
)

# Insight 3: 微信API限速问题仍未解决，需要队列机制
sia.log_improvement(
    "WeChat API限速(errcode -14)问题持续存在，需实现推送队列+指数退避机制",
    category="improvement"
)

# Insight 4: allowInsecureAuth安全配置仍未关闭
sia.log_improvement(
    "controlUi.allowInsecureAuth配置警告持续存在，建议关闭以提升安全性",
    category="security"
)

print('Improvements logged successfully!')

# Generate weekly report
print('\n=== Weekly Report ===')
report = sia.generate_weekly_report()
print(report)
