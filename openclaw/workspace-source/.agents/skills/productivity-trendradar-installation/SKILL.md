---
name: trendradar-installation
description: TrendRadar 热点聚合工具安装配置指南
---

# Trendradar Installation Guide

## 项目信息
- 官方：`sansan0/TrendRadar`（⭐ 52k）
- 功能：AI驱动热点聚合，监控35个平台，关键词筛选，多渠道推送

## 安装步骤

### 1. Fork 项目
```bash
gh repo fork sansan0/TrendRadar --clone
```

### 2. 安装依赖
```bash
cd ~/TrendRadar
pip3 install -r requirements.txt
playwright install --with-deps chromium
```

### 3. 配置飞书 Webhook
在 `config.yaml` 中设置 `lark_webhook` 为你的飞书群机器人 Webhook URL

飞书 Webhook 获取：飞书群 → 群设置 → 群机器人 → 添加机器人 → 自定义

### 4. 运行
```bash
python3 trendradar.py --mode incremental  # 增量推送
python3 trendradar.py --mode current     # 实时热点
python3 trendradar.py --serve-api        # 启动 API
```

## 本地状态（2026-04-21）
- ✅ 克隆到 ~/TrendRadar
- ✅ 依赖安装完成
- ⏳ 等待飞书 Webhook 配置

## 相关路径
- 项目：~/TrendRadar
- 主程序：~/TrendRadar/trendradar.py
- 配置：~/TrendRadar/config.yaml
