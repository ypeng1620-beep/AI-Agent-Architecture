# Claude Code 2.1.88 架构蒸馏

## 整体架构图

```
CLI 入口 (cli.tsx)
    │
    ├─> 快速路径: --version, --dump-system-prompt, --daemon-worker, --bridge, --bg
    │
    └─> main.tsx (startRepl / launchRepl)
            │
            ├─> init.ts (初始化: 配置、认证、MCP、插件)
            │       │
            │       ├─> enableConfigs() → loadGlobalConfig()
            │       ├─> checkAuth() → getClaudeAIOAuthTokens()
            │       ├─> initMCP() → MCPConnectionManager
            │       ├─> loadPlugins() → pluginLoader
            │       └─> initTelemetry()
            │
            ├─> AppStateProvider (React Context)
            │       └─> AppStateStore (Zustand store)
            │               ├─> settings, mcp, commands, agents
            │               └─> tools, messages, permissions
            │
            ├─> REPL (ink.tsx 终端UI)
            │       │
            │       ├─> PromptInput (用户输入)
            │       ├─> Messages (对话历史)
            │       └─> ToolUseLoader (工具调用渲染)
            │
            └─> QueryEngine (对话引擎)
                    │
                    ├─> query.ts (消息处理流水线)
                    │       │
                    │       ├─> processUserInput() → 解析命令/消息
                    │       │
                    │       └─> runQuery() → API调用循环
                    │               │
                    │               ├─> getSystemPrompt() → 合并系统提示
                    │               ├─> API调用 (claude.ts) → 流式响应
                    │               ├─> handleAPIStream() → 解析事件
                    │               └─> handleToolCall() → 工具执行
                    │
                    ├─> Tool 调用 (Tool.ts)
                    │       │
                    │       ├─> buildTool() → ToolDef<T>
                    │       ├─> toolMatchesName() → 工具匹配
                    │       └─> Tools: BashTool, FileEditTool, MCPTool, SkillTool, AgentTool...
                    │
                    └─> MCP Client (services/mcp/client.ts)
                            │
                            ├─> MCPConnectionManager
                            ├─> StdioClientTransport / SSEClientTransport
                            └─> ListToolsResult → 动态工具注册
```

---

## 核心模块分析

### 1. entrypoints/cli.tsx — CLI 入口
**职责：** 快速路径分发 + 模块懒加载
**设计模式：**
- 动态 import 最小化启动时间
- feature() gates 控制功能裁剪 (Bun bundle DCE)
- fast-path: --version (零导入), --daemon-worker, --bg, --bridge

**关键流程：**
```
process.argv → parse args → fast-path checks → main.tsx
```

### 2. main.tsx — 主应用 (808KB, 18000+行)
**职责：** 应用初始化 + REPL 启动
**核心依赖：**
```typescript
- init() → 配置/认证/MCP/插件初始化
- launchRepl() → 启动终端UI
- AppStateProvider → React Context (Zustand store)
- QueryEngine → 对话引擎
```

### 3. state/AppState.tsx / AppStateStore.ts — 状态管理
**职责：** 全局状态容器 (Zustand)
**核心状态：**
- `settings` — 用户配置
- `mcp: { commands, connections }` — MCP服务器状态
- `messages` — 对话历史
- `tools` — 可用工具列表
- `agents` — 子Agent状态
- `taskState` — 任务系统
- `speculationState` — 推测执行状态

**设计：** DeepImmutable 类型 + useSyncExternalStore

### 4. QueryEngine.ts — 对话引擎
**职责：** 消息处理 + API调用循环
**核心流程：**
```typescript
query(userMessage, context) → 
  processUserInput() → 
    runQuery() → 
      API stream → 
        handleToolCall() → 
          executeTool() → 
            render result
```

---

## 命令系统

### 架构：命令注册与路由

```
commands.ts (命令注册表)
    │
    ├─> COMMANDS[] — 内置命令 (~60+)
    │       ├── addDir, config, help, init, mcp, skills, status...
    │       └── Conditional: ultraplan, voice, buddy, proactive...
    │
    ├─> getSkillDirCommands() — ~/.claude/skills/ 目录
    ├─> getPluginCommands() — 插件命令
    ├─> getBundledSkills() — 捆绑技能
    └─> getDynamicSkills() — 动态发现的技能
```

### 命令类型 (Command type)
```typescript
type Command = 
  | { type: 'prompt'; getPromptForCommand(): Promise<ContentBlockParam[]> }  // 技能/斜杠命令
  | { type: 'local'; load(): Promise<LocalCommandModule> }                    // 本地命令
  | { type: 'local-jsx'; ... }                                               // React组件命令
```

### 命令路由流程
```
用户输入 "/skills" 
    ↓
PromptInput 捕获 "/" 前缀
    ↓
useTypeahead.tsx → 过滤命令 (typeahead matching)
    ↓
findCommand(name, commands) → 匹配命令
    ↓
execute:
  - prompt型 → getPromptForCommand() → 加入消息
  - local型 → load().then(m => m.call(args))
  - local-jsx型 → setToolJSX(<Component />)
```

### 关键文件
- `types/command.ts` — Command 类型定义
- `commands.ts` — 命令注册表 + getCommands()
- `skills/loadSkillsDir.ts` — 技能目录加载
- `utils/plugins/loadPluginCommands.ts` — 插件命令加载

---

## 工具系统

### Tool 基类 (Tool.ts)
```typescript
// 核心抽象
interface ToolDef<TInput, TOutput> {
  name: string
  description(): string | Promise<string>
  prompt(): string | Promise<string>
  inputSchema: TInput
  outputSchema: TOutput
  isOpenWorld?(): boolean
  isMcp?: boolean
  
  call(
    args: z.infer<TInput>, 
    context: ToolUseContext
  ): Promise<TOutput>
  
  checkPermissions(context): Promise<PermissionResult>
  
  // 渲染
  renderToolUseMessage(args, context): React.ReactNode
  renderToolResultMessage(result): React.ReactNode
  mapToolResultToToolResultBlockParam(content, toolUseID): ToolResultBlockParam
}

// buildTool 工厂函数
function buildTool<TInput, TOutput>(def: ToolDef<TInput, TOutput>): ToolDef<TInput, TOutput>
```

### 核心工具实现

| 工具 | 文件 | 职责 |
|------|------|------|
| BashTool | tools/BashTool/ | shell命令执行 |
| FileEditTool | tools/FileEditTool/ | 文件编辑 (diff展示) |
| FileReadTool | tools/FileReadTool/ | 文件读取 |
| FileWriteTool | tools/FileWriteTool/ | 文件写入 |
| MCPTool | tools/MCPTool/ | MCP协议工具代理 |
| SkillTool | tools/SkillTool/ | 技能执行 |
| AgentTool | tools/AgentTool/ | 子Agent启动 |
| WebSearchTool | tools/WebSearchTool/ | 网络搜索 |
| WebFetchTool | tools/WebFetchTool/ | 网页抓取 |
| TaskCreateTool | tools/TaskCreateTool/ | 任务创建 |
| GrepTool | tools/GrepTool/ | 代码搜索 |

### 工具执行流程
```
Model 请求 tool_use
    ↓
QueryEngine.handleToolCall()
    ↓
tools.ts → getTool(name) → ToolDef
    ↓
tool.checkPermissions() → 权限检查
    ↓
tool.call(args, context) → 执行
    ↓
tool.renderToolResultMessage() → 渲染结果
    ↓
tool.mapToolResultToToolResultBlockParam() → API格式
```

### 工具权限系统
- `ToolPermissionContext` — 权限模式 (default/auto/bypass/ask)
- `alwaysAllowRules` / `alwaysDenyRules` — 规则引擎
- `checkPermissions()` — 工具级别权限回调

---

## MCP 实现

### MCP Client 架构 (services/mcp/client.ts, 122KB)

```typescript
// MCP服务器连接
class MCPClient {
  serverName: string
  transport: Transport  // StdioClientTransport | SSEClientTransport | WebSocketTransport
  client: Client
  
  // 核心方法
  connect(config: McpServerConfig): Promise<void>
  listTools(): Promise<ListToolsResult>
  callTool(name, args): Promise<CallToolResult>
  listResources(): Promise<ServerResource[]>
  readResource(uri): Promise<string>
  
  // OAuth支持
  startOAuthFlow(): Promise<void>
  handleOAuthCallback(url): Promise<void>
}

// Transport 类型
type Transport = 'stdio' | 'sse' | 'sse-ide' | 'http' | 'ws' | 'sdk'
```

### MCP 工具注册流程
```
1. config.ts → 解析 mcp_settings.json
2. MCPConnectionManager → 管理所有MCPClient
3. client.listTools() → 获取工具列表
4. MCPTool.call() → 代理到对应client.callTool()
5. 动态注册到 AppState.mcp.commands
```

### MCP 关键类型 (services/mcp/types.ts)
```typescript
export type McpServerConfig = 
  | { type: 'stdio'; command: string; args: string[]; env?: Record<string,string> }
  | { type: 'sse'; url: string; headers?: Record<string,string>; oauth?: McpOAuthConfig }
  | { type: 'ws'; url: string; headers?: Record<string,string> }
  | { type: 'sdk'; command: string }  // IDE扩展

export interface MCPServerConnection {
  name: string
  client: MCPClient
  tools: ListToolsResult['tools']
  status: 'connecting' | 'connected' | 'error'
  config: ScopedMcpServerConfig
}
```

---

## Skills 系统

### 技能来源
1. **Skill目录** — `~/.claude/skills/` 或项目 `.claude/skills/`
2. **插件技能** — 插件包中的 skills/ 目录
3. **捆绑技能** — 内置的 bundledSkills/
4. **MCP技能** — MCP服务器的 prompts/list

### 技能加载 (skills/loadSkillsDir.ts)
```typescript
// 核心函数
getSkillDirCommands(cwd) → Command[]
  → 扫描 skills/*.md 或 skills/*/index.md
  → parseFrontmatter() → 提取 name, description, tools, whenToUse
  → 返回 PromptCommand { type: 'prompt', getPromptForCommand }

getBundledSkills() → Command[]
  → skills/bundledSkills.ts 静态注册

getPluginSkills() → Command[]
  → utils/plugins/loadPluginCommands.ts
```

### 技能执行 (tools/SkillTool/)
```typescript
class SkillTool {
  async call(args, context) {
    // 1. 解析技能名和参数
    // 2. findCommand(name, allCommands)
    // 3. skill.getPromptForCommand(args, context) → ContentBlockParam[]
    // 4. 将技能内容作为用户消息注入
    // 5. 如果 context === 'fork' → 启动子Agent
  }
}
```

### 技能 vs 工具
| 特性 | Skill | Tool |
|------|-------|------|
| 调用方式 | /技能名 或 SkillTool | 工具调用 |
| 执行方式 | 内容展开为消息 | 直接执行 |
| 上下文 | inline (当前会话) 或 fork (子Agent) | 直接执行 |
| 权限 | 继承调用者权限 | 独立权限检查 |

---

## 插件系统

### 插件架构 (utils/plugins/pluginLoader.ts, 113KB)

```typescript
// 插件结构
interface PluginManifest {
  name: string
  version: string
  description: string
  tools?: string[]           // 提供的工具
  commands?: string[]         // 提供的命令
  skills?: string[]          // 提供的技能
  agents?: string[]          // 提供的Agent类型
  hooks?: HookConfig[]       // 生命周期钩子
}

// 插件加载流程
loadPlugin(pluginDir) →
  validatePlugin() →
    parse manifest →
    check dependencies →
    load entry point →
  register commands/skills/tools →
  init hooks
```

### 插件类型
- **本地插件** — 本地目录
- **市场插件** — npm包 (marketplaceManager.ts)
- **内置插件** — bundledPlugins/

### 插件与工具/命令的集成
```
Plugin Manifest
    ├─> commands → getPluginCommands() → 命令注册表
    ├─> skills → getPluginSkills() → 技能系统
    ├─> tools → 动态工具加载 (plugin提供tool实现)
    └─> hooks → registerPluginHooks()
```

---

## React + Ink 终端UI

### 渲染架构 (ink/ 目录)

```
App (components/App.tsx)
    │
    ├─> FullscreenLayout
    │       ├─> Header (StatusLine, ModelPicker)
    │       ├─> Messages (VirtualMessageList)
    │       │       └─> MessageRow → Message → Markdown
    │       └─> PromptInput (用户输入)
    │
    └─> 对话式组件
            ├─> Diff (StructuredDiff.tsx)
            ├─> MCPServerDialog
            ├─> GlobalSearchDialog
            └─> TaskListV2
```

### Ink 核心 (ink/ 目录)
- `ink.tsx` (253KB) — Ink库核心 (React渲染器)
- `screen.ts` (50KB) — 屏幕管理
- `render-node-to-output.ts` (64KB) — 渲染引擎
- `parse-keypress.ts` (24KB) — 键盘事件解析

### 组件架构
- **Message.tsx** (79KB) — 消息渲染
- **Messages.tsx** (148KB) — 消息列表
- **VirtualMessageList.tsx** (149KB) — 虚拟滚动
- **PromptInput.tsx** — 命令输入
- **StatusLine.tsx** (49KB) — 状态栏

---

## 与 OpenClaw 集成方案

### 关键发现

#### 1. 工具系统对接点
Claude Code 的工具系统基于 `ToolDef<T>` 抽象，支持：
- 异步权限检查 `checkPermissions()`
- 动态工具注册通过 `AppState.mcp.commands`
- 工具结果渲染 `renderToolResultMessage()`

**建议 OpenClaw 接入方式：**
```
OpenClaw Tools → Claude Code ToolDef adapter
    ↓
tool.call() → OpenClaw tool handler
    ↓
result → renderToolResultMessage() → Claude Code UI
```

#### 2. MCP 协议对接
Claude Code 内置完整的 MCP 客户端实现：
- 支持 stdio/SSE/WebSocket 传输
- 动态工具列表
- OAuth 认证流程

**建议：**
```
OpenClaw MCP Server → Claude Code MCPClient
    ↓
listTools() → 暴露 OpenClaw 工具
    ↓
callTool() → 代理到 OpenClaw
```

#### 3. 命令/Skill 系统
Claude Code 的命令系统和技能系统高度模块化：
- `getCommands(cwd)` 返回所有可用命令
- SkillTool 支持 fork (子Agent) 执行模式
- 支持 MCP 提示词 (prompts/list)

**建议：**
```
OpenClaw Commands → Claude Code 命令注册
    ↓
SkillTool 执行 → OpenClaw skill handler
    ↓
context='fork' → OpenClaw 子Agent
```

#### 4. Agent/Coordinator 模式
`coordinatorMode.ts` 实现了完整的多Agent协调：
- AgentTool 启动子Agent
- SendMessageTool 继续Agent
- TaskStopTool 停止Agent
- 并行/串行任务编排

**建议 OpenClaw 参考：**
```
用户请求 → OpenClaw main agent
    ↓ (AgentTool)
子Agent → 独立ToolUseContext
    ↓ (SendMessageTool)
继续/同步
```

#### 5. API 客户端 (services/api/claude.ts)
```typescript
// 核心接口
class ClaudeAPI {
  createMessage(params: MessageParam[]): Promise<Stream<AssistantEvent>>
  // 支持:
  // - 流式响应
  // - 工具调用 (tool_use)
  // - 权限提升请求 (elicitation)
  // - 提示缓存 (prompt caching)
}
```

### OpenClaw 接入建议架构

```
OpenClaw
    │
    ├─> 复用 Claude Code 的 MCP Client
    │       └─> 连接到 OpenClaw MCP Server
    │               └─> 暴露 OpenClaw 工具
    │
    ├─> 复用 Claude Code 的 SkillTool
    │       └─> OpenClaw skills → getCommands()
    │
    ├─> 复用 Claude Code 的 AgentTool
    │       └─> OpenClaw subagent → runAgent()
    │
    └─> 复用 Claude Code 的 UI 组件
            └─> Ink 渲染管道
```

### 具体对接点清单

| Claude Code 模块 | OpenClaw 对接方式 |
|------------------|------------------|
| `services/mcp/client.ts` | MCP客户端连接 OpenClaw |
| `tools/MCPTool/` | MCP工具代理 |
| `tools/SkillTool/` | Skill执行适配 |
| `tools/AgentTool/` | 子Agent管理 |
| `coordinatorMode.ts` | 多Agent协调 |
| `commands.ts` | 命令注册表 |
| `skills/loadSkillsDir.ts` | 技能加载 |
| `ink.tsx` | React终端渲染 |
| `state/AppStateStore.ts` | Zustand状态管理 |

---

## 附录：关键类型速查

```typescript
// 工具定义
type ToolDef<TInput, TOutput> = {
  name: string
  description(): string | Promise<string>
  prompt(): string | Promise<string>
  inputSchema: TInput
  outputSchema: TOutput
  call(args: TInput, context: ToolUseContext): Promise<TOutput>
  checkPermissions(context: ToolUseContext): Promise<PermissionResult>
  renderToolUseMessage(args: TInput, context: ToolUseContext): React.ReactNode
  renderToolResultMessage(result: TOutput): React.ReactNode
}

// 命令定义
type Command = 
  | { type: 'prompt'; name: string; description: string; getPromptForCommand(): Promise<ContentBlockParam[]> }
  | { type: 'local'; name: string; load(): Promise<{ call(args: string): Promise<LocalCommandResult> }> }
  | { type: 'local-jsx'; name: string; Component: React.ComponentType }

// 工具使用上下文
type ToolUseContext = {
  options: {
    commands: Command[]
    tools: Tools
    mcpClients: MCPServerConnection[]
    mainLoopModel: string
  }
  abortController: AbortController
  getAppState(): AppState
  setAppState(f: (prev: AppState) => AppState): void
}

// MCP服务器连接
interface MCPServerConnection {
  name: string
  client: MCPClient
  tools: ListToolsResult['tools']
  status: 'connecting' | 'connected' | 'error'
}
```
