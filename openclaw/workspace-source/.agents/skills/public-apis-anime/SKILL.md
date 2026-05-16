---
name: public-apis-anime
description: Anime相关的免费API集合。包含19个API，所有信息来自public-apis项目。
triggers:
  - "需要Anime相关数据"
  - "调用AnimeAPI"
  - "动漫相关的免费API"
---

# Anime API 集合

## 概述
本技能收录19个免费的Anime相关API，涵盖动漫相关的免费API。

## 认证说明
- **无需认证**: 这些API可以直接调用，无需任何API密钥
- **API Key**: 需要从对应平台申请API密钥
- **OAuth**: 需要OAuth认证流程

## 常用API快速调用

### Jikan
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 非官方MyAnimeList API

```bash
curl -s "https://api.jikan.moe/v4/random/anime"
```

### Studio Ghibli
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 吉卜力工作室资源

```bash
curl -s "https://ghibliapi.herokuapp.com/films"
```

### Waifu.im
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 动漫角色图片

```bash
curl -s "https://api.waifu.im/search"
```

### AnimeFacts
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 动漫事实

```bash
curl -s "https://chandan-02.github.io/anime-facts-rest-api/"
```

### Trace Moe
**认证**: No
**HTTPS**: Yes
**CORS**: No
**描述**: 从截图获取动漫场景

```bash
curl -s "https://soruly.github.io/trace.moe-api/#/"
```


## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Jikan | No | Yes | Yes | 非官方MyAnimeList API |
| Studio Ghibli | No | Yes | Yes | 吉卜力工作室资源 |
| Waifu.im | No | Yes | Yes | 动漫角色图片 |
| AnimeFacts | No | Yes | Yes | 动漫事实 |
| Trace Moe | No | Yes | No | 从截图获取动漫场景 |
| Catboy | No | Yes | Yes | 猫男孩图片GIF |
| NekosBest | No | Yes | Yes | 猫图片和角色扮演GIF |
| AniAPI | OAuth | Yes | Yes | 动漫发现流媒体同步 |
| AniList | OAuth | Yes | Unknown | 动漫发现和追踪 |
| AnimeNewsNetwork | No | Yes | Yes | 动漫行业新闻 |
| Danbooru Anime | apiKey | Yes | Yes | 动漫艺术家数据库 |
| Kitsu | OAuth | Yes | Yes | 动漫平台 |
| MangaDex | apiKey | Yes | Unknown | 漫画数据库 |
| MyAnimeList | OAuth | Yes | Unknown | 动漫漫画数据库 |
| Shikimori | OAuth | Yes | Unknown | 动漫发现追踪论坛 |
| Waifu.pics | No | Yes | No | 动漫图片分享平台 |
| AnimeChan | No | Yes | No | 动漫语录 |
| AniDB | apiKey | No | Unknown | 动漫数据库 |
| Mangapi | apiKey | Yes | Unknown | 漫画翻译 |

## 注意事项
- CORS列显示是否支持跨域请求。"Unknown"表示不确定，建议先测试。
- 部分API有速率限制，使用时请注意。
- 如需生产环境使用，建议查看官方文档了解详细限制。
