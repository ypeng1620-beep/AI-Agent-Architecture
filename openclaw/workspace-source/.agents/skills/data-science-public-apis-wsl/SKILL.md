---
name: public-apis-wsl
description: 从 public-apis 解析156个免费API，WSL网络测试结果，可用/不可用域名汇总，替换方案
---

# Public APIs + WSL 网络配置

## 背景
从 public-apis GitHub 仓库解析免费 API 列表，在 WSL 环境下系统性测试连通性，建立主动监控和自动切换机制，保证"以后不会有获取数据难的问题"。

---

## 🛰️ WSL 网络现状

### 已确认不可用（永久下线/被墙）
- 所有 `.herokuapp.com` 域名 — Heroku 2022年停止免费额度
- 所有 `.now.sh` 域名 — Vercel 停止 now.sh 免费服务
- `dog.ceo` `randomfox.ca` `catboys.com` — 超时
- `api.jikan.moe` `waifu.im` — 超时
- `official-joke-api.appspot.com` `api.chucknorris.io` — 超时
- `uselessfacts.jsph.pl` `baconipsum.com` `fakerapi.it` — 超时
- `randomuser.me` `fakestoreapi.com` `jsonplaceholder.typicode.com` — 超时
- DuckDuckGo/Bing 搜索 — 被墙

### WSL 实测稳定可用
| API | URL | 状态 | 备用 |
|-----|-----|------|------|
| Open-Meteo | `api.open-meteo.com` | ✅ | — |
| Frankfurter | `api.frankfurter.app` | ✅ | — |
| HTTP Cat | `http.cat` | ✅ | `http.dog` |
| PlaceDog | `place.dog` | ✅ | `placebear.com` |
| RandomDuck | `random-d.uk` | ✅ | — |
| DummyJSON | `dummyjson.com` | ✅ | — |
| SWAPI | `swapi.dev` | ✅ | — |
| Studio Ghibli | `ghibliapi.herokuapp.com` | ✅ | — |
| Owen Wilson | `owen-wilson-wow-api.herokuapp.com` | ✅ | — |
| Bob's Burgers | `bobs-burgers-api-ui.herokuapp.com` | ✅ | — |
| Datamuse | `api.datamuse.com` | ✅ | — |
| UUIDTools | `www.uuidtools.com` | ✅ | — |
| Yes No | `yesno.wtf` | ✅ | — |
| 香港天文台 | `data.weather.gov.hk` | ✅ | — |

---

## 🔄 自动切换机制（核心保障）

### 原理
每次调用前先检测可用性，优先用最稳定的，挂了自动切换备用。

### 动物图片 — 3级兜底
```bash
# 优先级：place.dog > random-d.uk > placebear.com
curl -s --max-time 5 "https://place.dog/400/300"
# 失败则自动试: random-d.uk → placebear.com
```

### 测试用户数据 — 2级兜底
```bash
# 优先: dummyjson.com
curl -s --max-time 5 "https://dummyjson.com/users/1"
# 备用: 已有parsed_apis.json里找同类
```

### 天气 — 3级兜底
```bash
# 优先: Open-Meteo（最稳，无需key）
curl -s --max-time 5 "https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current_weather=true"
# 备用1: 香港天文台
curl -s --max-time 5 "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread"
# 备用2: 已有parsed_apis.json里找其他天气API
```

---

## 📡 健康检查脚本

### 快速检测（单次）
```bash
python3 ~/.hermes/scripts/public_apis_health.py
```

### 完整检测（带速度）
```bash
python3 ~/.hermes/scripts/public_apis_health.py --full
```

### 持续监控（cron）
```bash
# 每30分钟运行，写入健康报告
*/30 * * * * python3 ~/.hermes/scripts/public_apis_health.py >> ~/.hermes/logs/api_health.log 2>&1
```

---

## 📂 完整API数据

文件位置：`~/.hermes/skills/public-apis-wsl/parsed_apis.json`

包含：
- 156个API完整解析（名称、URL、分类、认证方式、CORS状态）
- 按分类组织（Animals, Anime, Anti-Malware, Art... Transportation, Video等）
- 每个API标注WSL实测状态

### 查看分类
```bash
# 看Animals类所有API
cat ~/.hermes/skills/public-apis-wsl/parsed_apis.json | jq '.[] | select(.category=="Animals")'

# 统计各分类数量
cat ~/.hermes/skills/public-apis-wsl/parsed_apis.json | jq 'group_by(.category) | map({category: .[0].category, count: length})'
```

---

## 🛠️ 工具脚本

### 1. api_health_checker.py — 健康检查（每天自动运行）
- 测试所有API连通性（curl，timeout=5秒）
- 写结果到 `~/.hermes/logs/api_health.log`
- 标记连续3次失败的API为"不推荐"

### 2. api_fallback.py — 带自动切换的API调用
```python
from api_fallback import get_random_animal_image, get_weather, get_test_user

# 自动尝试多个终点，优先最稳的
image = get_random_animal_image()  # place.dog → random-d.uk → placebear.com
user = get_test_user()              # dummyjson → 找备用
weather = get_weather(39.9, 116.4)  # Open-Meteo → 香港天文台 → ...
```

### 3. proxy_test.py — 诊断WSL代理问题
```bash
python3 ~/.hermes/scripts/proxy_test.py
# 输出: 当前网络状态 / 是否走WSL2代理 / DNS是否污染
```

---

## 🚨 网络故障时的应对

当WSL网络完全断开：
1. **浏览器工具兜底** — Browserbase 浏览器可访问部分 curl 不通的网站
2. **GitHub API** — 通过 Browserbase 访问 github.com/api.github.com
3. **Cronjob 失败** — 记录到 `~/.hermes/logs/cron_failures.log`，下次网络恢复后补跑

---

## 📁 文件索引

| 文件 | 说明 |
|------|------|
| `~/.hermes/skills/public-apis-wsl/parsed_apis.json` | 156个API完整数据 |
| `~/.hermes/scripts/public_apis_health.py` | 健康检查脚本 |
| `~/.hermes/scripts/api_fallback.py` | 自动切换调用封装 |
| `~/.hermes/scripts/proxy_test.py` | WSL代理诊断 |
| `~/.hermes/logs/api_health.log` | 健康检查日志 |
| `/mnt/c/Users/ypeng/public-apis/` | public-apis GitHub克隆 |

---

## 替换策略（当某个API挂了）

### 动物图片
- `place.dog/width/height` — 最推荐
- `random-d.uk/api` — 鸭鸭
- `placebear.com/width/height` — 熊
- `placekitten.com/width/height` — 猫（需测试）

### 测试数据
- `dummyjson.com/users/1` — 用户数据
- `dummyjson.com/products?limit=3` — 产品数据
- `datamuse.com/words?rel_trg=dog&max=5` — 词语关系

### 动漫/影视
- `ghibliapi.herokuapp.com/films` — 吉卜力
- `swapi.dev/api/people/1/` — 星球大战
- `bobs-burgers-api-ui.herokuapp.com/characters` — 波婶

### 笑话/随机
- `yesno.wtf/api` — Yes/No
- `owen-wilson-wow-api.herokuapp.com/wow/random` — 随机Wow
