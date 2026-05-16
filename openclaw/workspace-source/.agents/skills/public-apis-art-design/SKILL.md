---
name: public-apis-art-design
description: Art & Design相关的免费API集合。包含20个API，所有信息来自public-apis项目。
triggers:
  - "需要Art & Design相关数据"
  - "调用Art & DesignAPI"
  - "艺术、设计和图标的免费API"
---

# Art & Design API 集合

## 概述
本技能收录20个免费的Art & Design相关API，涵盖艺术、设计和图标的免费API。

## 认证说明
- **无需认证**: 这些API可以直接调用，无需任何API密钥
- **API Key**: 需要从对应平台申请API密钥
- **OAuth**: 需要OAuth认证流程

## 常用API快速调用

### Art Institute of Chicago
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 芝加哥艺术学院藏品

```bash
curl -s "https://api.artic.edu/docs/"
```

### EmojiHub
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 分类表情符号

```bash
curl -s "https://github.com/cheatsnake/emojihub"
```

### Lordicon
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 带动画图标

```bash
curl -s "https://lordicon.com/"
```

### PHP-Noise
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 噪点背景生成器

```bash
curl -s "https://php-noise.com/"
```

### xColors
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 颜色生成转换

```bash
curl -s "https://x-colors.herokuapp.com/"
```


## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Art Institute of Chicago | No | Yes | Yes | 芝加哥艺术学院藏品 |
| EmojiHub | No | Yes | Yes | 分类表情符号 |
| Lordicon | No | Yes | Yes | 带动画图标 |
| PHP-Noise | No | Yes | Yes | 噪点背景生成器 |
| xColors | No | Yes | Yes | 颜色生成转换 |
| Icon Horse | No | Yes | Yes | 网站图标带后备 |
| Icons8 | No | Yes | Unknown | 图标 |
| Pixel Encounter | No | Yes | No | SVG图标生成器 |
| Colormind | No | No | Unknown | 配色方案生成器 |
| ColourLovers | No | No | Unknown | 图案调色板图片 |
| Cooper Hewitt | apiKey | Yes | Unknown | 史密森设计博物馆 |
| Dribbble | OAuth | Yes | Unknown | 发现设计师 |
| Europeana | apiKey | Yes | Unknown | 欧洲博物馆画廊 |
| Harvard Art Museums | apiKey | No | Unknown | 艺术 |
| Iconfinder | apiKey | Yes | Unknown | 图标 |
| Metropolitan Museum of Art | No | Yes | No | 大都会艺术博物馆 |
| Noun Project | OAuth | No | Unknown | 图标 |
| Rijksmuseum | apiKey | Yes | Unknown | Rijks博物馆数据 |
| Word Cloud | apiKey | Yes | Unknown | 词云生成 |
| Améthyste | apiKey | Yes | Unknown | Discord用户图片生成 |

## 注意事项
- CORS列显示是否支持跨域请求。"Unknown"表示不确定，建议先测试。
- 部分API有速率限制，使用时请注意。
- 如需生产环境使用，建议查看官方文档了解详细限制。
