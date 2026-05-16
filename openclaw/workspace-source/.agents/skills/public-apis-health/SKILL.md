---
name: public-apis-health
description: Health相关免费API集合，包含16个API。
triggers:
  - "需要Health数据"
  - "调用HealthAPI"
---

# Health API集合

## 概述
收录16个Health相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请

## 常用API
### Covid-19
```bash
curl -s "https://covid19api.com/"
```
### Covid-19 Live Data
```bash
curl -s "https://github.com/mathdroid/covid-19-api"
```
### Open Disease
```bash
curl -s "https://disease.sh/"
```
### Quarantine
```bash
curl -s "https://quarantine.country/coronavirus/api/"
```
### Covid-19 JHU CSSE
```bash
curl -s "https://nuttaphat.com/covid19-api/"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Infermedica | apiKey | Yes | Yes | NLP症状检查 |
| Covid-19 | No | Yes | Yes | Covid 19传播 |
| Covid-19 Live Data | No | Yes | Yes | 全球Covid摘要 |
| Open Disease | No | Yes | Yes | Covid流感 |
| Quarantine | No | Yes | Yes | Covid实时更新 |
| Covid-19 JHU CSSE | No | Yes | Yes | JHU CSSE Covid数据 |
| LAPIS | No | Yes | Yes | SARS-CoV-2基因组 |
| Coronavirus UK | No | Yes | Unknown | 英国Covid数据 |
| COVID-19 Tracker Canada | No | Yes | Unknown | 加拿大Covid |
| Healthcare.gov | No | Yes | Unknown | 医疗保险信息 |
| FoodData Central | apiKey | Yes | Unknown | 营养数据库 |
| NPPES | No | Yes | Unknown | 医疗保健提供者 |
| CMS.gov | apiKey | Yes | Unknown | 医疗保险数据 |
| Covid Tracking | No | Yes | No | 美国Covid数据 |
| Humanitarian Data Exchange | No | Yes | Unknown | 人道主义数据 |
| openFDA | apiKey | Yes | Unknown | FDA药物器械食品 |
