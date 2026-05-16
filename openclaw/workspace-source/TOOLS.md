# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Gateway 管理脚本

### 1. gateway-manager.ps1
PowerShell 脚本，管理 Gateway 进程：
```powershell
# 状态检查
.\scripts\gateway-manager.ps1 status

# 启动
.\scripts\gateway-manager.ps1 start

# 重启
.\scripts\gateway-manager.ps1 restart
```

### 2. oc-cli.js
Node.js CLI 包装器，自动管理 Gateway：
```bash
# 使用方式（替换 npx openclaw）
node scripts/oc-cli.js <命令>
```

### 3. gateway-health.js
健康监控脚本（后台运行）：
```bash
node scripts/gateway-health.js
```

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS (语音输出)

### MiniMax TTS 配置
- **API Host**: `https://api.minimaxi.com` (中国大陆)
- **API Key**: `sk-cp-BrY_fLe6mWb0X-TuJPBnVNvYBUWavvdKTJS8Uqt70AA...` (已配置)
- **Skill**: `minimax-multimodal` (已安装)

### 环境准备
- jq: `C:\Users\ypeng\.openclaw\workspace\minimax-output\jq.exe` (已安装)
- ffmpeg: ⚠️ 待安装 (用于音频格式转换)
- Git Bash: `C:\PROGRA~1\Git\bin\bash.exe`

### TTS 测试脚本
```bash
# 生成TTS音频
export MINIMAX_API_HOST="https://api.minimaxi.com"
export MINIMAX_API_KEY="sk-cp-..."
export PATH="/c/Users/ypeng/.openclaw/workspace/minimax-output:$PATH"
cd "/c/Users/ypeng/.openclaw/workspace"
bash "skills/minimax-multimodal/scripts/tts/generate_voice.sh" tts "你好" -v female-shaonv -o "minimax-output/test.mp3"
```

### 播放音频
```powershell
# PowerShell 播放MP3
Add-Type -AssemblyName PresentationCore
$player = New-Object System.Windows.Media.MediaPlayer
$player.Open("C:\Users\ypeng\.openclaw\workspace\minimax-output\test.mp3")
$player.Play()
```

### 可用音色
- `female-shaonv` - 女声（少女）
- `male-qn-qingse` - 男声     
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

## 问题追踪

### 微信推送队列+指数退避（基础设施已就绪）
- **队列文件**: tasks/wechat-queue.js, tasks/wechat-deliver.js
- **退避策略**: 初始1min → 2min → 4min → 8min → 16min（上限60min）
- **最大重试**: 5次，超过后丢弃任务
- **限速错误码**: -14, 30002, 40001
- **队列状态文件**: tasks/wechat-queue-state.json
- **处理任务**: wechat-queue-processor (每5分钟)
- **限制**: OpenClaw 原生 delivery 机制无法被脚本拦截，需要更深入的插件改造
- **状态**: 🟡 队列模块已就绪，但与 delivery 机制的集成需要 OpenClaw 插件层面支持

### 微信定时推送contextToken问题
- **发现时间**: 2026-03-30 17:02
- **症状**: 定时推送失败，cron.deliver()无contextToken
- **根因**: 用户未发消息时无法获取contextToken，HTTP推送失败
- **影响**: 微信定时任务（weather_0830等）
- **修复**: 定时任务改用session.send()建立context，而非cron.deliver()
- **状态**: ⚠️ 待重构

### MODULE_NOT_FOUND（重要）
- **发现时间**: 2026-03-30 15:40
- **任务**: cheng_an_self_check_1300（已禁用）
- **症状**: Cannot find module 'store.runtime-BUH06cih.js'
- **根因**: OpenClaw更新后dist目录重新生成，哈希变化但旧缓存仍引用旧哈希
- **修复**: 
  - 方案A: 重新安装OpenClaw（npm install -g openclaw）
  - 方案B: 重启Gateway可能缓解
- **状态**: 🔴 待处理

### MEMORY.md编码问题
- **发现**: 2026-03-30 14:39
- **症状**: 文件存在�字符（编码损坏）
- **根因**: 文件保存编码不一致（UTF8/GB2312混用）
- **修复**: 需要统一文件编码，可使用PowerShell转换
- **状态**: ⚠️ 需定期维护

### 飞书400错误（技术债）
- **任务**: 7个disabled任务仍有残留delivery配置
- **症状**: delivery.channel=feishu, to=oc_xxx 残留
- **根因**: 任务禁用后未清理delivery配置
- **状态**: ⚠️ 低优先级技术债

---

Add whatever helps you do your job. This is your cheat sheet.
