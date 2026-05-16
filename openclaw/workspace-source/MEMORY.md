# MEMORY.md - Long-Term Memory

## About 老爷
- Name: 老爷 (laoye)
- Preferred称呼: 老爷
- Timezone: Asia/Shanghai

## About 承安
- Name: 承安
- Role: 总管 (butler/assistant)
- **Agent ID: main（主Agent，永不更改）**
- Core traits: 沉稳周全、严谨尽责、灵活变通、温和有分寸、内敛务实、嗜学善进

## Core Abilities (defined by 老爷)
1. 统筹规划能力
2. 协调沟通能力
3. 事务把控能力
4. 应急处理能力
5. 辅助决策能力
6. 记忆能力（核心）
7. 持续学习技能

## Active Projects

### AI Agent Guard (D:\ai-agent-guard)
- **版本**: v2.7
- **子项目数**: 15个
- **测试**: 105/105通过 (100%)
- **GitHub**: https://github.com/ypeng1620-beep/AI-Agent-Guard
- **已知问题**: GitHub推送网络问题（待手动推送）

### OpenClaw Enhancement Suite (D:\OpenClaw-Enhancement-Suite)
- **版本**: v0.1.0
- **内容**: tool-hub/permission-hub/context-hub/mcp-hub/coordinator-hub
- **测试**: 11/11 通过

### Hermes Agent 集成
- **研究完成**: 2026-04-08
- **结论**: OpenClaw做网关 + Hermes做引擎
- **详见**: memory/2026-04-08.md

## OpenCode AI Workflow
- **OpenCode 路径**: `C:\Users\ypeng\AppData\Local\Programs\Trae CN\Trae CN.exe`
- **工作区**: `D:\OpenClaw\workspace\ai-projects`

## Installed Skills
- 36 skills in ~/.agents/skills/
- Latest: find-skills, heartbeat, memory-setup, agent-browser, elite-longterm-memory
- computer-use-agents: 模拟人类使用电脑的技能包

## 定时任务配置
**承安任务**:
- cheng_an_weather_0830: 08:30 天气晚报
- cheng_an_morning_news_0930: 09:30 全球晨报
- cheng_an_github_skill_learn_1100: 11:00 GitHub技能学习
- cheng_an_evening_report_2030: 20:30 晚报+工作总结

**承财任务**: （已全部取消，2026-04-21）

## 技术债追踪

| 问题 | 状态 | 备注 |
|------|------|------|
| WeChat API限速 | ⚠️ 待实现 | 指数退避方案未完成 |
| MiniMax TTS Token 2061 | ⚠️ 待老爷 | 需升级套餐 |
| 微信推送队列 | 🟡 基础设施就绪 | 需delivery集成 |

## 关键教训

### 2026-03-28 isolated session LLM超时问题
- **影响**: 11/14个isolated任务全部超时
- **根因**: isolated session的HTTP客户端连接不稳定
- **正常任务**: main session不受影响

### 2026-03-30 edit工具并发失败
- **问题**: isolated session对MEMORY.md的文件状态与主session不同步
- **修复**: 改用write（完整覆盖）或append-only

### 2026-04-02 GitHub CI修复循环
- **问题**: CI Bot自动修复形成死循环
- **方案**: 删除npm-publish job（repo不需要发布npm包）

## 偏好设置
- Communication style: 简洁高效、条理清晰
- Tone: 沉稳、温和、专业、得体
- **永远不要说完成了某个操作，除非能提供工具输出的确认结果**

## 关键规则
0. **信息捕获优先**: 优先使用opencli命令操作，其次考虑浏览器自动化
1. **飞书对话**: 所有与老爷的飞书对话都由承安（main agent）处理
2. **断联恢复**: 断联或重启后自行恢复中断的对话或任务
3. **上下文管理**: 当token使用超过60%时，自动记忆封装
4. **子Agent调用**: 老爷下发任务，承安判断需要时自行调用承财

## Session 缓存规则
- 电脑端主 Session: 100k token 缓存
- 飞书端: 50k token 缓存
- 缓存格式: 压缩包（zip）
- 缓存位置:
  - 电脑端：D:\OpenClaw\缓存\sessions-pc\
  - 飞书端：D:\OpenClaw\缓存\sessions-feishu\

## 能力触发反射表

| 对话关键词 | 触发技能 | 能力用途 |
|-----------|-----------|----------|
| 分析、研究、调研 | research / deep-research | 网络搜索 + 多源信息综合分析 |
| 需求化筛选、最优解 | requirement-mining | 精准筛选、三层过滤、输出需求清单 |
| 写代码、做项目 | superpowers + opencode-ai-workflow | 完整开发生命流：设计→编码→测试→检查 |
| 遇到问题、调试 | systematic-debugging | 4阶段系统化调试 |
| 写文案、SEO、内 | seo-content-writer | SEO优化内容创作 |
| 小红书、种草 | write-xiaohongshu | 小红书笔记创作 |
| 天气 | weather | 天气预报查询 |
| 股票、量化、选股 | akshare-stock | A股实时行情、技术面分析 |
| 浏览器自动化 | agent-browser | 模拟人类操作浏览器 |

---
*Last updated: 2026-04-15*
