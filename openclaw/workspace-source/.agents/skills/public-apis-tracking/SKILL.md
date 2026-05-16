---
name: public-apis-tracking
description: Tracking相关免费API集合，包含8个API。
triggers:
  - "需要Tracking数据"
  - "调用TrackingAPI"
---

# Tracking API集合

## 概述
收录8个Tracking相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请

## 常用API
### PostalPinCode
```bash
curl -s "http://www.postalpincode.in/Api-Details"
```
### WhatPulse
```bash
curl -s "https://developer.whatpulse.org/#web-api"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Aftership | apiKey | Yes | Yes | 货运追踪 |
| PostalPinCode | No | Yes | Unknown | 印度Pincode |
| WhatPulse | No | Yes | Unknown | 键盘鼠标使用 |
| Correios | apiKey | Yes | Unknown | 巴西Correios |
| PostNord | apiKey | No | Unknown | 瑞典丹麦包裹追踪 |
| Postmon | No | No | Unknown | 巴西邮政编码 |
| Pixela | X-Mashape-Key | Yes | Yes | 习惯追踪 |
| UPS | apiKey | Yes | Unknown | 货运地址 |
