---
name: anthropic-intel
description: 当用户丢来 Anthropic 链接/话题时，输出"功能/趋势的分流机会评估"报告
category: research
---

# Anthropic 情报分析技能

## 触发条件

用户丢来以下任一内容时激活：
- Anthropic 新闻/博客/推文链接
- 任何关于 Claude / Anthropic 产品功能的话题
- Anthropic 新发布、新动态的讨论邀请

## 核心工作流

1. **内容抓取**
   - 若为链接：用 `browser_navigate` 打开并抓取正文
   - 若为话题：用 `web_search` 搜集 Anthropic 官方博客 / 推特 / 新闻稿

2. **情报整合**（三路并行）
   - Anthropic 官方信息（产品功能、定价、路线图）
   - 公开信息（TechCrunch / VentureBeat / 主流科技媒体）
   - 竞品动态（OpenAI、Google DeepMind、Meta AI 等的对应能力）

3. **分流机会评估**
   输出结构化报告，包含：

   ```
   ## [功能/趋势名称] 分流机会评估

   ### 一、痛点分析
   - 用户当前的核心痛点是什么？
   - Anthropic 这项功能的解决程度如何？
   - 仍有哪类需求未被满足？

   ### 二、竞品短板
   - OpenAI / Google / Meta 对应能力的差距
   - 现有方案的定价与可用性问题
   - 生态锁定 vs 开放性矛盾

   ### 三、落地速度评估
   - 技术可行性（自研 / 基于开源 / 合作）
   - 预计开发周期（周/月）
   - 依赖的外部条件

   ### 四、价格锚点建议
   - 竞品现有定价区间
   - 建议价格分层（入门/专业/企业）
   - 价值主张一句话定位
   ```

4. **存档**
   - 同步保存到 `~/wiki/entities/anthropic-agent-engineering.md`
   - 格式：Markdown，附时间戳、来源链接

## 输出规范

- 语言：中文为主，关键术语保留英文
- 长度：500–1200 字
- 必须包含：来源链接、竞品对比数据、价格锚点具体数字
- 避免：空泛结论，每一点必须有数据或逻辑支撑

## 辅助工具

- `browser_navigate` + `browser_snapshot`：抓取网页内容
- `web_search`：搜索公开报道与竞品信息
- `write_file`：保存报告到 ~/wiki/entities/
