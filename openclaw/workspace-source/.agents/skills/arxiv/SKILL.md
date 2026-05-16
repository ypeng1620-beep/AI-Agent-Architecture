---
name: arxiv
description: 学术论文搜索技能。通过 arXiv API 搜索和获取论文，支持关键词/作者/分类查询，BibTeX 生成，引用追踪。无需 API Key。
triggers:
  - "搜索论文"
  - "查 arxiv"
  - "找学术文献"
  - "arXiv"
  - "学术研究"
---

# arXiv 学术论文搜索

通过 arXiv 免费 REST API 搜索和获取学术论文，无需 API Key。

## 快速命令

| 操作 | 命令 |
|------|------|
| 搜索论文 | `curl "https://export.arxiv.org/api/query?search_query=all:关键词"` |
| 获取指定论文 | `curl "...id_list=论文ID"` |
| 读取摘要 | `web_extract(urls=["https://arxiv.org/abs/论文ID"])` |
| 读取全文 | `web_extract(urls=["https://arxiv.org/pdf/论文ID"])` |

## 搜索语法

| 前缀 | 搜索范围 | 示例 |
|------|---------|------|
| `all:` | 全部字段 | `all:transformer+attention` |
| `ti:` | 标题 | `ti:large+language+models` |
| `au:` | 作者 | `au:vaswani` |
| `abs:` | 摘要 | `abs:reinforcement+learning` |
| `cat:` | 分类 | `cat:cs.AI` |
| `co:` | 评论 | `co:accepted+NeurIPS` |

### 布尔运算

```
# AND (默认)
search_query=all:transformer+attention

# OR
search_query=all:GPT+OR+all:BERT

# AND NOT
search_query=all:language+model+ANDNOT+all:vision

# 精确短语
search_query=ti:"chain+of+thought"
```

## 常用分类

| 分类 | 领域 |
|------|------|
| `cs.AI` | 人工智能 |
| `cs.CL` | 计算语言学（NLP）|
| `cs.CV` | 计算机视觉 |
| `cs.LG` | 机器学习 |
| `cs.CR` | 密码学与安全 |
| `stat.ML` | 机器学习（统计）|

## 完整研究工作流

1. **搜索**：`curl "https://export.arxiv.org/api/query?search_query=all:关键词&max_results=5"`
2. **查引用**：用 Semantic Scholar API 查引用数和相关论文
3. **读摘要**：`web_extract(urls=["https://arxiv.org/abs/论文ID"])`
4. **读全文**：`web_extract(urls=["https://arxiv.org/pdf/论文ID"])`
5. **找相关**：`curl "https://api.semanticscholar.org/graph/v1/paper/arXiv:ID/references?limit=10"`
6. **追踪作者**：`curl "https://api.semanticscholar.org/graph/v1/author/search?query=作者名"`

## Semantic Scholar API（引用追踪）

| 操作 | 命令 |
|------|------|
| 论文详情 | `curl "https://api.semanticscholar.org/graph/v1/paper/arXiv:ID?fields=title,authors,citationCount,year"` |
| 谁引用了 | `curl "...paper/arXiv:ID/citations?limit=10"` |
| 引用了谁 | `curl "...paper/arXiv:ID/references?limit=10"` |
| 相关论文 | `curl -X POST "...recommendations/v1/papers/" -d '{"positivePaperIds": ["arXiv:ID"]}'` |

## BibTeX 生成

```bash
curl -s "https://export.arxiv.org/api/query?id_list=论文ID" | python3 -c "
import sys, xml.etree.ElementTree as ET
ns = {'a': 'http://www.w3.org/2005/Atom'}
root = ET.parse(sys.stdin).getroot()
entry = root.find('a:entry', ns)
title = entry.find('a:title', ns).text.strip().replace('\n', ' ')
authors = ' and '.join(a.find('a:name', ns).text for a in entry.findall('a:author', ns))
year = entry.find('a:published', ns).text[:4]
raw_id = entry.find('a:id', ns).text.strip().split('/abs/')[-1]
print(f'@article{{{last_name}{year}_{raw_id.replace(\".\", \"\")}}},')
"
```

## 注意事项

- arXiv 返回 Atom XML 格式，需解析
- Semantic Scholar 返回 JSON，速率限制 1 req/s
- 论文 ID 格式：新版 `2402.03300`，旧版 `hep-th/0601001`
- PDF 地址：`https://arxiv.org/pdf/{id}`，摘要：`https://arxiv.org/abs/{id}`
- 读取全文用 `web_extract` 即可

## 限速

| API | 速率 | 认证 |
|-----|------|------|
| arXiv | ~1 req / 3秒 | 无 |
| Semantic Scholar | 1 req / 秒 | 无（100 req/s 需 API Key）|
