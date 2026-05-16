# 定时任务配置

## 承安任务

| 任务ID | 时间 | 类型 | 状态 |
|--------|------|------|------|
| cheng_an_weather_0830 | 08:30 | 天气预报 | ✅ |
| cheng_an_morning_news_0930 | 09:30 | 全球晨报 | ✅ |
| cheng_an_github_skill_learn_1100 | 11:00 | GitHub技能学习 | ✅ |
| cheng_an_self_check_1300 | 13:00 | 午间自我巡检 | ✅ |
| cheng_an_evening_report_2030 | 20:30 | 晚报+工作总结 | ✅ |
| cheng_an_self_evolve_bg | 每小时 | 自我进化 | ✅ |
| knowledge-sync | 每小时 | 知识库同步 | ✅ |

## 承财任务

| 任务ID | 时间 | 类型 | 状态 |
|--------|------|------|------|
| cheng_cai_daily_report_0900 | 09:00 | 开盘前检查 | ✅ |
| cheng_cai_daily_monitor_1000 | 10:00 | 盘中监控 | ✅ |
| cheng_cai_stock_select_1415 | 14:15 | 低价选股 | ✅ |
| cheng_cai_stock_select_1450 | 14:50 | 尾盘选股 | ✅ |
| cheng_cai_close_check_1530 | 15:30 | 收盘验证 | ✅ |
| cheng_cai_evolve_1800 | 18:00 | 进化复盘 | ✅ |
| cheng_cai_night_study_2000 | 20:00 | 夜间学习 | ✅ |

## 报告转发机制

当前每个 cron 任务已配置 `delivery: { mode: "announce", channel: "feishu" }`，任务完成后自动发送到飞书。

新增汇总任务：
| 任务ID | 时间 | 说明 |
|--------|------|------|
| chengcai_daily_summary | 21:00 | 汇总当日所有承财报告 |
