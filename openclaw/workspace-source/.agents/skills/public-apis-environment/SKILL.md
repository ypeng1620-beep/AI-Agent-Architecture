---
name: public-apis-environment
description: Environment相关免费API集合，包含17个API。
triggers:
  - "需要Environment数据"
  - "调用EnvironmentAPI"
---

# Environment API集合

## 概述
收录17个Environment相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请

## 常用API
### CO2 Offset
```bash
curl -s "https://co2offset.io/api.html"
```
### PM2.5 Open Data
```bash
curl -s "https://pm25.lass-net.org/#apis"
```
### Danish Energi
```bash
curl -s "https://www.energidataservice.dk/"
```
### National Grid ESO
```bash
curl -s "https://data.nationalgrideso.com/"
```
### UK Carbon Intensity
```bash
curl -s "https://carbon-intensity.github.io/api-definitions/#carbon-intensity-api-v1-0-0"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| CO2 Offset | No | Yes | Unknown | 碳足迹 |
| OpenAQ | apiKey | Yes | Unknown | 开放空气质量数据 |
| PM2.5 Open Data | No | Yes | Unknown | PM2.5传感器数据 |
| Carbon Interface | apiKey | Yes | Yes | 碳排放估算 |
| Climatiq | apiKey | Yes | Yes | 环境足迹 |
| IQAir | apiKey | Yes | Unknown | 空气质量和天气 |
| BreezoMeter Pollen | apiKey | Yes | Unknown | 每日花粉条件 |
| Danish Energi | No | Yes | Unknown | 开放能源数据 |
| National Grid ESO | No | Yes | Unknown | 英国电力系统数据 |
| UK Carbon Intensity | No | Yes | Unknown | 碳强度API |
| Website Carbon | No | Yes | Unknown | 网站碳足迹 |
| GrünstromIndex | No | No | Yes | 德国绿色电力指数 |
| Luchtmeetnet | No | Yes | Unknown | 荷兰空气质量 |
| Cloverly | apiKey | Yes | Unknown | 碳计算 |
| PVWatts | apiKey | Yes | Unknown | 太阳能发电 |
| Srp Energy | apiKey | Yes | No | 每小时用电报告 |
| PM25.in | apiKey | No | Unknown | 中国空气质量 |
