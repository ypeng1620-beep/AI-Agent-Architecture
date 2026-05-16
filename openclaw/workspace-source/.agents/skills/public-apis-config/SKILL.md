---
name: public-apis-config
description: # Public APIs 配置技能  ## 用途 快速调用 156 个免费公共 API，带健康检查和备选域名。 ...
---
# Public APIs 配置技能

## 用途
快速调用 156 个免费公共 API，带健康检查和备选域名。

## 已知问题
- WSL 网络不稳定，部分 herokuapp/now.sh 服务已下线
- 大量域名在国内连接超时
- 建议优先使用稳定可用的 API

---

## ✅ 确认可用（WSL实测）

### 天气
```bash
# Open-Meteo - 天气预报（无需key）
curl -s "https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current_weather=true&hourly=temperature_2m"

# 香港天文台
curl -s "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread"
```

### 货币汇率
```bash
# Frankfurter - 欧元汇率（无需key）
curl -s "https://api.frankfurter.app/latest?from=USD&to=CNY"
curl -s "https://api.frankfurter.app/currencies"
```

### 测试数据
```bash
# JSONPlaceholder - 经典测试API
curl -s "https://jsonplaceholder.typicode.com/users/1"

# dummyjson - 用户/产品数据
curl -s "https://dummyjson.com/users/1"
curl -s "https://dummyjson.com/products?limit=3"

# Datamuse - 词语关系
curl -s "https://api.datamuse.com/words?rel_trg=dog&max=5"
curl -s "https://api.datamuse.com/words?sp=dog&max=5"
```

### 动物图片
```bash
# RandomDuck - 鸭鸭图
curl -s "https://random-d.uk/api"

# PlaceDog - 随机狗图
curl -s "https://place.dog/200/300"

# HTTP Cat/Dog - HTTP状态码配图
curl -s "https://http.cat/200"
curl -s "https://http.dog/404"
```

### 影视/动漫
```bash
# Studio Ghibli - 吉卜力电影数据
curl -s "https://ghibliapi.herokuapp.com/films"
curl -s "https://ghibliapi.herokuapp.com/people"

# SWAPI - 星球大战百科
curl -s "https://swapi.dev/api/people/1/"
curl -s "https://swapi.dev/api/films/1/"

# Owen Wilson Wow
curl -s "https://owen-wilson-wow-api.herokuapp.com/wow/random"
```

### 工具类
```bash
# UUID生成
curl -s "https://www.uuidtools.com/api/generate/v4/count/1"

# Yes No
curl -s "https://yesno.wtf/api"
```

---

## ⚠️ 网络不稳定/已下线

以下 API 域名在 WSL 环境下连接超时，建议使用备选或自建：

### 已确认下线
| API | 原URL | 状态 |
|-----|-------|------|
| Cat Facts | catfact.ninja | ❌ heroku已下线 |
| Dog CEO | dog.ceo | ❌ 超时 |
| MeowFacts | meowfacts.herokuapp | ❌ heroku已下线 |
| RandomFox | randomfox.ca | ❌ 超时 |
| Catboy | catboys.com | ❌ 超时 |
| Jikan | api.jikan.moe | ❌ 超时 |
| AnimeFacts | anime-facts-rest-api | ❌ 超时 |
| Waifu.im | waifu.im | ❌ 超时 |
| Official Joke | official-joke-api.appspot | ❌ 超时 |
| Chuck Norris | api.chucknorris.io | ❌ 超时 |
| USeless Facts | uselessfacts.jsph.pl | ❌ 超时 |
| Bacon Ipsum | baconipsum.com | ❌ 超时 |
| FakerAPI | fakerapi.it | ❌ 超时 |
| RandomUser | randomuser.me | ❌ 超时 |
| FakeStoreAPI | fakestoreapi.com | ❌ 超时 |

### 替代方案
- **动物图片** → `https://place.dog` / `https://random-d.uk`
- **随机事实** → `https://api.frankfurter.app` (货币趣闻)
- **测试用户数据** → `https://dummyjson.com`
- **翻译** → 自建 LibreTranslate 或用 DeepL/Google Translate API

---

## 按类别快速索引

### Animals (21个免费)
`random-d.uk` `place.dog` `placebear.com` `placekitten.com` `http.cat` `http.dog`

### Anime (10个免费)
`ghibliapi.herokuapp.com` `bobs-burgers-api-ui.herokuapp.com`

### Test Data (20个免费)
`dummyjson.com` `jsonplaceholder.typicode.com` `datamuse.com` `uuidtools.com` `yesno.wtf`

### Weather (10个免费)
`api.open-meteo.com` (最稳定) `data.weather.gov.hk`

### Transportation (31个免费)
多数为各国交通局API，需查看具体文档

### Video (28个免费)
`swapi.dev` `ghibliapi.herokuapp.com` `owen-wilson-wow-api.herokuapp.com`

---

## 完整API列表
见 `~/.hermes/skills/public-apis-config/parsed_apis.json`

## 网络诊断
```bash
# 测试基础连通性
curl -s --max-time 5 "https://http.cat/200"

# 批量测试
for url in "url1" "url2"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$url")
  echo "$code | $url"
done
```
