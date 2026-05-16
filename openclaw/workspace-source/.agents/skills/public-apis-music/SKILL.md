---
name: public-apis-music
description: Music相关免费API集合，包含16个API。
triggers:
  - "需要Music数据"
  - "调用MusicAPI"
---

# Music API集合

## 概述
收录16个Music相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请
- **OAuth**: 需要认证

## 常用API
### Radio Browser
```bash
curl -s "https://api.radio-browser.info/"
```
### Lyrics.ovh
```bash
curl -s "https://lyricsovh.docs.apiary.io"
```
### Genrenator
```bash
curl -s "https://binaryjazz.us/genrenator-api/"
```
### Songsterr
```bash
curl -s "https://www.songsterr.com/a/wa/api/"
```
### Bandsintown
```bash
curl -s "https://app.swaggerhub.com/apis/Bandsintown/PublicAPI/3.0.0"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Radio Browser | No | Yes | Yes | 互联网电台 |
| Lyrics.ovh | No | Yes | Unknown | 歌曲歌词 |
| Napster | apiKey | Yes | Yes | 音乐 |
| Mixcloud | OAuth | Yes | Yes | 音乐 |
| Genrenator | No | Yes | Unknown | 音乐流派生成器 |
| AI Mastering | apiKey | Yes | Yes | 自动音乐母带 |
| Songlink / Odesli | apiKey | Yes | Yes | 歌曲可用性 |
| Songsterr | No | Yes | Unknown | 吉他贝斯鼓谱 |
| Bandsintown | No | Yes | Unknown | 音乐活动 |
| Songkick | apiKey | Yes | Unknown | 音乐活动 |
| 7digital | OAuth | Yes | Unknown | 音乐商店 |
| Deezer | OAuth | Yes | Unknown | 音乐 |
| Discogs | OAuth | Yes | Unknown | 音乐 |
| Freesound | apiKey | Yes | Unknown | 音乐样本 |
| Genius | OAuth | Yes | Unknown | 歌词音乐 |
| iTunes Search | No | Yes | Unknown | iTunes |
