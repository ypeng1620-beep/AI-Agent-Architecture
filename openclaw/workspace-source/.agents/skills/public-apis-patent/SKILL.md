---
name: public-apis-patent
description: Patent相关免费API集合，包含4个API。
triggers:
  - "需要Patent数据"
  - "调用PatentAPI"
---

# Patent API集合

## 概述
收录4个Patent相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请
- **OAuth**: 需要认证

## 常用API
### PatentsView
```bash
curl -s "https://patentsview.org/apis/purpose"
```
### USPTO
```bash
curl -s "https://www.uspto.gov/learning-and-resources/open-data-and-mobility"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| PatentsView | No | Yes | Unknown | 美国创新趋势 |
| EPO | OAuth | Yes | Unknown | 欧洲专利搜索 |
| USPTO | No | Yes | Unknown | 美国专利API |
| TIPO | apiKey | Yes | Unknown | 台湾专利搜索 |
