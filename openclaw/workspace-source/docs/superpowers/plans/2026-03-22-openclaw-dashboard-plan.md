# OpenClaw 控制面板实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个实时监控 OpenClaw Gateway 状态的 Web 控制面板

**Architecture:** Vue3 前端通过 WebSocket 对接 FastAPI 后端，后端采集 Gateway/API/端口状态并推送前端展示

**Tech Stack:** Vue3 + ElementPlus + TailwindCSS (前端) | FastAPI + WebSocket (后端)

---

## 文件结构

```
D:\OpenClaw-Dashboard\
├── backend/
│   ├── main.py              # FastAPI 主入口 + WebSocket
│   ├── requirements.txt     # Python 依赖
│   └── data_collector.py    # 数据采集模块
├── frontend/
│   ├── src/
│   │   ├── App.vue          # 根组件
│   │   ├── main.js          # 入口
│   │   ├── components/
│   │   │   └── StatusCard.vue  # 状态卡片组件
│   │   └── styles/
│   │       └── main.css     # 全局样式（深蓝主题）
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── start.bat                 # Windows 一键启动
├── start.sh                  # Mac/Linux 启动
└── 部署指南.md
```

---

## Chunk 1: 后端开发

### Task 1: 创建后端目录和依赖文件

**Files:**
- Create: `D:\OpenClaw-Dashboard\backend\requirements.txt`

- [ ] **Step 1: 创建 requirements.txt**

```txt
fastapi==0.109.0
uvicorn[websocket]==0.27.0
websockets==12.0
psutil==5.9.8
httpx==0.26.0
python-dotenv==1.0.0
```

- [ ] **Step 2: 创建后端目录结构**

```powershell
mkdir -p D:\OpenClaw-Dashboard\backend
```

- [ ] **Step 3: Commit**

---

### Task 2: 实现数据采集模块

**Files:**
- Create: `D:\OpenClaw-Dashboard\backend\data_collector.py`

- [ ] **Step 1: 创建 data_collector.py**

```python
"""
数据采集模块：采集 Gateway、VSCode、Trae 状态
"""
import asyncio
import httpx
import psutil
import socket
from datetime import datetime
from typing import Optional

GATEWAY_URL = "http://127.0.0.1:18789"
VSCODE_PORT = 8080
TRAE_PORT = 9090


class DataCollector:
    def __init__(self):
        self.gateway_process = self._find_gateway_process()
    
    def _find_gateway_process(self) -> Optional[psutil.Process]:
        """查找 Gateway 进程"""
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmdline = proc.info.get('cmdline') or []
                cmdline_str = ' '.join(cmdline)
                if 'openclaw' in cmdline_str.lower() or 'gateway' in cmdline_str.lower():
                    return proc
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return None
    
    async def get_gateway_status(self) -> dict:
        """获取 Gateway 状态"""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{GATEWAY_URL}/")
                return {
                    "running": resp.status_code == 200,
                    "status": "running" if resp.status_code == 200 else "stopped"
                }
        except Exception:
            return {"running": False, "status": "stopped"}
    
    def get_gateway_resources(self) -> dict:
        """获取 Gateway 进程资源占用"""
        if not self.gateway_process:
            return {"cpu": 0, "memory": 0}
        try:
            cpu = self.gateway_process.cpu_percent(interval=0.1)
            mem = self.gateway_process.memory_info().rss / 1024 / 1024  # MB
            return {"cpu": round(cpu, 1), "memory": round(mem, 1)}
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return {"cpu": 0, "memory": 0}
    
    def check_port(self, port: int) -> bool:
        """检测端口是否开放"""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        try:
            result = sock.connect_ex(('127.0.0.1', port))
            return result == 0
        except Exception:
            return False
        finally:
            sock.close()
    
    async def collect(self) -> dict:
        """采集所有数据"""
        gateway_status = await self.get_gateway_status()
        gateway_resources = self.get_gateway_resources()
        
        return {
            "gateway_status": gateway_status.get("status", "stopped"),
            "gateway_cpu": gateway_resources.get("cpu", 0),
            "gateway_memory": gateway_resources.get("memory", 0),
            "vscode_status": "connected" if self.check_port(VSCODE_PORT) else "disconnected",
            "trae_status": "connected" if self.check_port(TRAE_PORT) else "disconnected",
            "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
```

- [ ] **Step 2: Commit**

```bash
git add backend/data_collector.py
git commit -m "feat: add data collector module"
```

---

### Task 3: 实现 FastAPI 主入口和 WebSocket

**Files:**
- Create: `D:\OpenClaw-Dashboard\backend\main.py`

- [ ] **Step 1: 创建 main.py**

```python
"""
OpenClaw 控制面板后端 - FastAPI + WebSocket
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from data_collector import DataCollector

collector = DataCollector()
ws_connections: list[WebSocket] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时创建采集任务
    asyncio.create_task(data_push_loop())
    yield


app = FastAPI(title="OpenClaw Dashboard API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket 端点"""
    await websocket.accept()
    ws_connections.append(websocket)
    try:
        while True:
            data = await collector.collect()
            await websocket.send_json(data)
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in ws_connections:
            ws_connections.remove(websocket)


async def data_push_loop():
    """定时采集并推送数据"""
    while True:
        if ws_connections:
            data = await collector.collect()
            # 批量发送
            for ws in ws_connections[:]:
                try:
                    await ws.send_json(data)
                except Exception:
                    pass
        await asyncio.sleep(1)


@app.get("/")
async def root():
    return {"status": "ok", "service": "OpenClaw Dashboard"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
```

- [ ] **Step 2: 测试后端启动**

```bash
cd D:\OpenClaw-Dashboard\backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: add FastAPI with WebSocket"
```

---

## Chunk 2: 前端开发

### Task 4: 创建 Vue3 前端项目

**Files:**
- Create: `D:\OpenClaw-Dashboard\frontend\package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "openclaw-dashboard-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.15",
    "element-plus": "^2.5.3",
    "@element-plus/icons-vue": "^2.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.3",
    "vite": "^5.0.11",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  }
})
```

- [ ] **Step 3: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#0a1929',
        'card-blue': '#112240',
        'accent-blue': '#64ffda',
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Commit**

---

### Task 5: 前端页面开发

**Files:**
- Create: `D:\OpenClaw-Dashboard\frontend\index.html`
- Create: `D:\OpenClaw-Dashboard\frontend\src\main.js`
- Create: `D:\OpenClaw-Dashboard\frontend\src\App.vue`
- Create: `D:\OpenClaw-Dashboard\frontend\src\styles\main.css`
- Create: `D:\OpenClaw-Dashboard\frontend\src\components\StatusCard.vue`

- [ ] **Step 1: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OpenClaw 控制面板</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#0a1929" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 2: 创建 src/main.js**

```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import './styles/main.css'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

- [ ] **Step 3: 创建 src/styles/main.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #0a1929;
  --bg-card: #112240;
  --text-primary: #e6f1ff;
  --text-secondary: #8892b0;
  --accent: #64ffda;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  min-height: 100vh;
}

.dark {
  color-scheme: dark;
}
```

- [ ] **Step 4: 创建 StatusCard.vue 组件**

```vue
<template>
  <div class="status-card" :class="statusClass">
    <div class="card-header">
      <el-icon :size="24" class="card-icon">
        <component :is="icon" />
      </el-icon>
      <span class="card-title">{{ title }}</span>
    </div>
    <div class="card-content">
      <div class="status-value">{{ value }}</div>
      <div v-if="subValue" class="status-sub">{{ subValue }}</div>
    </div>
    <div class="card-footer">
      <span class="status-badge" :class="badgeClass">{{ badge }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Monitor, Cpu, Connection, Tool } from '@element-plus/icons-vue'

const props = defineProps({
  title: String,
  value: [String, Number],
  subValue: String,
  badge: String,
  type: {
    type: String,
    default: 'default' // default, success, warning, error
  },
  icon: {
    type: Object,
    default: () => Monitor
  }
})

const statusClass = computed(() => `type-${props.type}`)
const badgeClass = computed(() => `badge-${props.type}`)
</script>

<style scoped>
.status-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.type-success { border-left: 4px solid #67c23a; }
.type-warning { border-left: 4px solid #e6a23c; }
.type-error { border-left: 4px solid #f56c6c; }
.type-default { border-left: 4px solid #409eff; }

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-icon {
  color: var(--accent);
}

.card-title {
  font-size: 14px;
  color: var(--text-secondary);
}

.card-content {
  margin-bottom: 16px;
}

.status-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
}

.status-sub {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.status-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
}

.badge-success { background: rgba(103, 194, 58, 0.2); color: #67c23a; }
.badge-warning { background: rgba(230, 162, 60, 0.2); color: #e6a23c; }
.badge-error { background: rgba(245, 108, 108, 0.2); color: #f56c6c; }
.badge-default { background: rgba(64, 158, 255, 0.2); color: #409eff; }
</style>
```

- [ ] **Step 5: 创建 App.vue 主组件**

```vue
<template>
  <div class="dashboard">
    <header class="header">
      <h1 class="title">OpenClaw 控制面板</h1>
      <span class="update-time">更新时间: {{ data.update_time }}</span>
    </header>

    <div class="grid">
      <StatusCard
        title="Gateway 状态"
        :value="data.gateway_status === 'running' ? '运行中' : '已停止'"
        :badge="data.gateway_status"
        :type="data.gateway_status === 'running' ? 'success' : 'error'"
        :icon="Monitor"
      />
      
      <StatusCard
        title="CPU 占用"
        :value="data.gateway_cpu + '%'"
        :subValue="data.gateway_cpu > 50 ? '较高' : '正常'"
        :badge="data.gateway_cpu > 50 ? 'warning' : 'normal'"
        :type="data.gateway_cpu > 50 ? 'warning' : 'default'"
        :icon="Cpu"
      />
      
      <StatusCard
        title="内存占用"
        :value="data.gateway_memory + ' MB'"
        :subValue="data.gateway_memory > 500 ? '较高' : '正常'"
        :badge="data.gateway_memory > 500 ? 'warning' : 'normal'"
        :type="data.gateway_memory > 500 ? 'warning' : 'default'"
        :icon="Cpu"
      />
      
      <StatusCard
        title="VSCode"
        :value="data.vscode_status === 'connected' ? '已连接' : '未连接'"
        :badge="data.vscode_status"
        :type="data.vscode_status === 'connected' ? 'success' : 'warning'"
        :icon="Connection"
      />
      
      <StatusCard
        title="Trae"
        :value="data.trae_status === 'connected' ? '已连接' : '未连接'"
        :badge="data.trae_status"
        :type="data.trae_status === 'connected' ? 'success' : 'warning'"
        :icon="Tool"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { Monitor, Cpu, Connection, Tool } from '@element-plus/icons-vue'
import StatusCard from './components/StatusCard.vue'

const data = reactive({
  gateway_status: 'stopped',
  gateway_cpu: 0,
  gateway_memory: 0,
  vscode_status: 'disconnected',
  trae_status: 'disconnected',
  update_time: '--'
})

let ws = null

onMounted(() => {
  ws = new WebSocket('ws://localhost:8000/ws')
  
  ws.onmessage = (event) => {
    const newData = JSON.parse(event.data)
    Object.assign(data, newData)
  }
  
  ws.onerror = () => {
    console.error('WebSocket 连接错误')
  }
  
  ws.onclose = () => {
    console.log('WebSocket 连接关闭')
  }
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.update-time {
  font-size: 14px;
  color: var(--text-secondary);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat: add Vue3 frontend with ElementPlus"
```

---

## Chunk 3: 部署脚本

### Task 6: 创建一键启动脚本

**Files:**
- Create: `D:\OpenClaw-Dashboard\start.bat`
- Create: `D:\OpenClaw-Dashboard\start.sh`

- [ ] **Step 1: 创建 start.bat (Windows)**

```bat
@echo off
chcp 65001 >nul
echo ========================================
echo   OpenClaw 控制面板一键启动
echo ========================================
echo.

REM 检测系统
echo [1/4] 检测环境...

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Python，请先安装 Python 3.9+
    pause
    exit /b 1
)

REM 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

echo 环境检测完成

REM 启动后端
echo [2/4] 启动后端服务...
cd /d "%~dp0backend"
pip install -r requirements.txt >nul 2>&1
start "OpenClaw Backend" cmd /k "uvicorn main:app --host 0.0.0.0 --port 8000"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端
echo [3/4] 启动前端服务...
cd /d "%~dp0frontend"
npm install >nul 2>&1
start "OpenClaw Frontend" cmd /k "npm run dev"

echo.
echo [4/4] 启动完成!
echo.
echo   后端: http://localhost:8000
echo   前端: http://localhost:3000
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:3000
```

- [ ] **Step 2: 创建 start.sh (Mac/Linux)**

```bash
#!/bin/bash
echo "========================================"
echo "  OpenClaw 控制面板一键启动"
echo "========================================"

# 检测环境
echo "[1/4] 检测环境..."

if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 Python，请先安装 Python 3.9+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "环境检测完成"

# 启动后端
echo "[2/4] 启动后端服务..."
cd "$(dirname "$0")/backend"
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3

# 启动前端
echo "[3/4] 启动前端服务..."
cd "$(dirname "$0")/frontend"
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "[4/4] 启动完成!"
echo ""
echo "  后端: http://localhost:8000"
echo "  前端: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待退出
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

- [ ] **Step 3: Commit**

```bash
git add start.bat start.sh
git commit -m "feat: add startup scripts"
```

---

### Task 7: 创建部署文档

**Files:**
- Create: `D:\OpenClaw-Dashboard\部署指南.md`

- [ ] **Step 1: 创建部署指南**

```markdown
# OpenClaw 控制面板部署指南

## 环境要求

- Python 3.9+
- Node.js 18+
- Windows / macOS / Linux

## 快速启动

### Windows
双击运行 `start.bat`

### macOS / Linux
```bash
chmod +x start.sh
./start.sh
```

## 手动启动

### 1. 启动后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

## 访问

- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- WebSocket: ws://localhost:8000/ws

## 功能说明

| 模块 | 说明 |
|------|------|
| Gateway 状态 | 显示运行/停止状态 |
| CPU 占用 | Gateway 进程 CPU 使用率 |
| 内存占用 | Gateway 进程内存使用量 |
| VSCode | 8080 端口连接状态 |
| Trae | 9090 端口连接状态 |

## 目录结构

```
OpenClaw-Dashboard/
├── backend/           # FastAPI 后端
│   ├── main.py        # 主入口
│   ├── data_collector.py  # 数据采集
│   └── requirements.txt   # 依赖
├── frontend/          # Vue3 前端
│   ├── src/           # 源代码
│   ├── package.json
│   └── vite.config.js
├── start.bat          # Windows 启动脚本
├── start.sh           # Linux/Mac 启动脚本
└── 部署指南.md
```

## 故障排除

### 后端无法启动
- 检查端口 8000 是否被占用
- 确认 Python 依赖已安装: `pip install -r requirements.txt`

### 前端无法启动
- 检查 Node.js 版本是否 18+
- 删除 node_modules 重新安装: `rm -rf node_modules && npm install`

### WebSocket 连接失败
- 确认后端已启动在 8000 端口
- 检查防火墙是否阻止连接
```

- [ ] **Step 2: Commit**

```bash
git add 部署指南.md
git commit -m "docs: add deployment guide"
```

---

## 验证清单

- [ ] 后端能正常启动并响应 /health
- [ ] WebSocket 能正常推送数据
- [ ] 前端能通过 npm run dev 启动
- [ ] 前端能连接 WebSocket 并显示数据
- [ ] start.bat 能一键启动前后端
- [ ] 深蓝主题正常显示
- [ ] 响应式布局在手机端正常
- [ ] 部署指南内容完整
```

