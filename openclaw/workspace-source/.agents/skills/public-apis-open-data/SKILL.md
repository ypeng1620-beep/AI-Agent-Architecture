---
name: public-apis-open-data
description: Open Data相关免费API集合，包含14个API。
triggers:
  - "需要Open Data数据"
  - "调用Open DataAPI"
---

# Open Data API集合

## 概述
收录14个Open Data相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请
- **OAuth**: 需要认证

## 常用API
### Nobel Prize
```bash
curl -s "https://www.nobelprize.org/about/developer-zone-2/"
```
### Microlink.io
```bash
curl -s "https://microlink.io"
```
### OpenSanctions
```bash
curl -s "https://www.opensanctions.org/docs/api/"
```
### API Setu
```bash
curl -s "https://www.apisetu.gov.in/"
```
### Wikipedia
```bash
curl -s "https://www.mediawiki.org/wiki/API:Main_page"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Nobel Prize | No | Yes | Yes | 诺贝尔奖 |
| LinkPreview | apiKey | Yes | Yes | URL摘要预览 |
| Microlink.io | No | Yes | Yes | 提取结构化数据 |
| OpenSanctions | No | Yes | Yes | 制裁犯罪PEP |
| Socrata | OAuth | Yes | Yes | 政府开放数据 |
| API Setu | No | Yes | Yes | 印度政府KYC |
| Wikipedia | No | Yes | Unknown | 百科全书 |
| Wikidata | OAuth | Yes | Unknown | 知识库 |
| Archive.org | No | Yes | No | 互联网档案馆 |
| Kaggle | apiKey | Yes | Unknown | Kaggle数据集 |
| Yelp | OAuth | Yes | Unknown | 本地商业 |
| Teleport | No | Yes | Unknown | 生活质量数据 |
| Universities List | No | Yes | Unknown | 大学名国家 |
| UPC database | apiKey | Yes | Unknown | 条码号150万+ |
