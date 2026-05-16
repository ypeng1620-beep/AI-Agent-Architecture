---
name: public-apis-animals
description: Animals相关的免费API集合。包含26个API，所有信息来自public-apis项目。
triggers:
  - "需要Animals相关数据"
  - "调用AnimalsAPI"
  - "动物相关的免费API"
---

# Animals API 集合

## 概述
本技能收录26个免费的Animals相关API，涵盖动物相关的免费API。

## 认证说明
- **无需认证**: 这些API可以直接调用，无需任何API密钥
- **API Key**: 需要从对应平台申请API密钥

## 常用API快速调用

### Dog Facts
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 狗的随机事实

```bash
curl -s "https://kinduff.github.io/dog-api/"
```

### Dogs
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 斯坦福狗数据集

```bash
curl -s "https://dog.ceo/api/breeds/image/random"
```

### HTTP Cat
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 每个HTTP状态的猫图片

```bash
curl -s "https://http.cat/200"
```

### HTTP Dog
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 每个HTTP状态的狗图片

```bash
curl -s "https://http.dog/"
```

### PlaceBear
**认证**: No
**HTTPS**: Yes
**CORS**: Yes
**描述**: 熊占位图

```bash
curl -s "https://placebear.com/300/300"
```


## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Dog Facts | No | Yes | Yes | 狗的随机事实 |
| Dogs | No | Yes | Yes | 斯坦福狗数据集 |
| HTTP Cat | No | Yes | Yes | 每个HTTP状态的猫图片 |
| HTTP Dog | No | Yes | Yes | 每个HTTP状态的狗图片 |
| PlaceBear | No | Yes | Yes | 熊占位图 |
| PlaceDog | No | Yes | Yes | 狗占位图 |
| PlaceKitten | No | Yes | Yes | 猫占位图 |
| RandomDog | No | Yes | Yes | 随机狗图片 |
| RandomFox | No | Yes | No | 随机狐狸图片 |
| Shibe.Online | No | Yes | Yes | 柴犬猫或鸟随机图片 |
| Zoo Animals | No | Yes | Yes | 动物园动物 |
| AdoptAPet | apiKey | Yes | Yes | 领养宠物资源 |
| Cat Facts | No | Yes | No | 每日猫事实 |
| Cataas | No | Yes | No | 猫图片服务 |
| FishWatch | No | Yes | Yes | 鱼类物种信息 |
| MeowFacts | No | Yes | No | 随机猫事实 |
| Movebank | No | Yes | Yes | 动物迁徙数据 |
| Petfinder | apiKey | Yes | Yes | 宠物寻找家 |
| RandomDuck | No | Yes | No | 随机鸭子图片 |
| The Dog | apiKey | Yes | No | 狗的公共服务 |
| Axolotl | No | Yes | No | 美西螈图片和事实 |
| eBird | apiKey | Yes | No | 鸟类观察数据 |
| IUCN | apiKey | No | No | IUCN受威胁物种红色名录 |
| RescueGroups | No | Yes | Unknown | 领养 |
| xeno-canto | No | Yes | Unknown | 鸟类录音 |
| Cats | apiKey | Yes | No | 猫图片 |

## 注意事项
- CORS列显示是否支持跨域请求。"Unknown"表示不确定，建议先测试。
- 部分API有速率限制，使用时请注意。
- 如需生产环境使用，建议查看官方文档了解详细限制。
