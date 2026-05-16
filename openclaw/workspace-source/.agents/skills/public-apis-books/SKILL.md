---
name: public-apis-books
description: Books相关的免费API集合。包含23个API，所有信息来自public-apis项目。
triggers:
  - "需要Books相关数据"
  - "调用BooksAPI"
  - "书籍和文学相关的免费API"
---

# Books API 集合

## 概述
本技能收录23个免费的Books相关API，涵盖书籍和文学相关的免费API。

## 认证说明
- **无需认证**: 这些API可以直接调用，无需任何API密钥
- **API Key**: 需要从对应平台申请API密钥
- **OAuth**: 需要OAuth认证流程

## 常用API快速调用

### Bible-api
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 免费多语言圣经API

```bash
curl -s "https://bible-api.com/john+3:16"
```

### Gutendex
**认证**: No
**HTTPS**: Yes
**CORS**: Unknown
**描述**: 古登堡图书库

```bash
curl -s "https://gutendex.com/books?search=python"
```

### Penguin Publishing
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 图书封面

```bash
curl -s "http://www.penguinrandomhouse.biz/webservices/rest/"
```

### PoetryDB
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 诗歌集合

```bash
curl -s "https://poetrydb.org/title/length"
```

### Quran-api
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 90+语言免费古兰经API

```bash
curl -s "https://github.com/fawazahmed0/quran-api#readme"
```


## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Bible-api | No | Yes | Yes | 免费多语言圣经API |
| Gutendex | No | Yes | Unknown | 古登堡图书库 |
| Penguin Publishing | No | Yes | Yes | 图书封面 |
| PoetryDB | No | Yes | Yes | 诗歌集合 |
| Quran-api | No | Yes | Yes | 90+语言免费古兰经API |
| Quran | No | Yes | Yes | RESTful古兰经API |
| Quran Cloud | No | Yes | Yes | RESTful古兰经API |
| Thirukkural | No | Yes | Yes | 泰米尔和英语1330蒂鲁库拉尔诗 |
| Wizard World | No | Yes | Yes | 哈利波特宇宙 |
| Bhagavad Gita | apiKey | Yes | Yes | 开源薄伽梵歌API |
| Bhagavad Gita | OAuth | Yes | Yes | 薄伽梵歌文本 |
| Ganjoor | OAuth | Yes | Yes | 波斯古典诗歌 |
| Open Library | No | Yes | No | 图书封面数据 |
| Crossref Metadata Search | No | Yes | Unknown | 图书文章元数据 |
| British National Bibliography | No | No | Unknown | 图书 |
| A Bíblia Digital | apiKey | Yes | No | 多语言圣经 |
| Bhagavad Gita telugu | No | Yes | Yes | 泰卢固语奥里雅语薄伽梵歌 |
| GurbaniNow | No | Yes | Unknown | 快速Gurbani REST API |
| Rig Veda | No | Yes | Unknown | 梨俱吠陀曼陀罗 |
| The Bible | apiKey | Yes | Unknown | 圣经一切 |
| Vedic Society | No | Yes | Unknown | 吠陀文献名词 |
| Wolne Lektury | No | Yes | Unknown | 波兰电子书 |
| Google Books | OAuth | Yes | Unknown | 图书 |

## 注意事项
- CORS列显示是否支持跨域请求。"Unknown"表示不确定，建议先测试。
- 部分API有速率限制，使用时请注意。
- 如需生产环境使用，建议查看官方文档了解详细限制。
