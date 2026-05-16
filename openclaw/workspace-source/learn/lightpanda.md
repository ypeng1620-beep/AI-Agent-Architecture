# Lightpanda 学习笔记

## 概述
- **全称**: Lightpanda Browser
- **Stars**: 22,400 ⭐
- **语言**: Zig (从零编写，非 Chromium/WebKit 分支)
- **定位**: 专为 AI Agent 和自动化设计的无头浏览器

## 核心理念
> Not a Chromium fork. Not a WebKit patch. A new browser, written in Zig.

**特点：**
- 从零编写，非现有浏览器分支
- 专为无头使用场景优化
- 极低内存占用
- 极致性能

## 性能对比

| 指标 | Lightpanda | Chrome |
|------|-------------|--------|
| 内存占用 | 1x (基准) | 9x |
| 执行速度 | 11x faster | 1x |
| 启动时间 | 瞬时 | 较慢 |

## 支持的 API

### 已支持
- JavaScript 执行
- 部分 Web APIs (持续开发中)

### 兼容协议
- **CDP** (Chrome DevTools Protocol)
- 支持 **Puppeteer**
- 支持 **Playwright** ⚠️
- 支持 **chromedp**

> ⚠️ Playwright 兼容性说明：
> Playwright 会根据浏览器功能选择不同执行路径。Lightpanda 新增 Web API 后，Playwright 可能选择未实现的代码路径。如遇问题请提交 Issue。

## 快速开始

### 安装 (Linux/macOS)
```bash
curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux && \
chmod a+x ./lightpanda

# macOS
curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-aarch64-macos && \
chmod a+x ./lightpanda
```

### Docker 安装
```bash
docker run -d --name lightpanda -p 9222:9222 lightpanda/browser:nightly
```

### 基本使用

#### 1. 直接抓取页面
```bash
./lightpanda fetch --obey_robots --log_format pretty --log_level info https://example.com
```

#### 2. 启动 CDP 服务器
```bash
./lightpanda serve --obey_robots --log_format pretty --log_level info --host 127.0.0.1 --port 9222
```

#### 3. Puppeteer 示例
```javascript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.connect({
  browserWSEndpoint: "ws://127.0.0.1:9222",
});

const context = await browser.createBrowserContext();
const page = await context.newPage();

await page.goto('https://example.com', {waitUntil: "networkidle0"});
const title = await page.title();
console.log(title);
```

#### 4. Playwright 示例
```javascript
import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('ws://127.0.0.1:9222');
// 正常使用 Playwright API
```

## 应用场景

### 1. AI Agent 自动化
- 网页交互
- 表单填写
- 数据抓取

### 2. LLM 训练数据收集
- 高效网页抓取
- 大规模数据采集

### 3. 网页测试
- 自动化测试
- 视觉回归测试

### 4. 爬虫
- 高效数据抓取
- 低资源消耗

## 与现有工具对比

| 特性 | Lightpanda | Puppeteer/Playwright (Chrome) |
|------|-------------|------------------------------|
| 内存 | 极低 | 高 |
| 速度 | 极快 | 慢 |
| 启动 | 瞬时 | 慢 |
| 维护 | Zig (轻量) | Chromium (庞大) |
| Web API | 部分 | 完整 |

## 优缺点
**优点：**
- 极低内存占用 (9x less)
- 极快执行速度 (11x faster)
- 瞬时启动
- 现代化代码库 (Zig)
- 开源

**缺点：**
- Web API 支持不完整
- Playwright 兼容性不稳定
- 相对年轻，社区较小
- Windows 支持有限 (WSL2)

## 适合场景
- 资源受限环境
- 大规模网页抓取
- AI Agent 简单网页操作
- 需要高并发的自动化任务

## 不适合场景
- 复杂 Web 应用测试
- 需要完整 Web API 的场景
- 生产级 Playwright 脚本

## 安装检查
```bash
# 验证安装
./lightpanda --version

# 查看帮助
./lightpanda --help
```
