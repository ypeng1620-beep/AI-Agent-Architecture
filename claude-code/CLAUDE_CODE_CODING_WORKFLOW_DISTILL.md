# Phase 4: Claude Code Coding Workflow 蒸馏

## 一、Claude Code 核心机制分析

### 1.1 工具集（Tool Suite）

Claude Code 提供完整的浏览器 + 终端工具集：

| 工具 | 功能 |
|------|------|
| `browser_navigate` | 导航到 URL |
| `browser_snapshot` | 获取页面快照（可访问性树）|
| `browser_click/ref/type/scroll` | 页面交互 |
| `browser_vision` | 截图 + AI 视觉分析 |
| `browser_console` | JS 错误检测 |
| `terminal` | 执行 Shell 命令 |
| `execute_code` | Python/JS 代码执行 |
| `read_file/write_file/edit_file` | 文件操作 |
| `search_files/grep` | 代码搜索 |
| `glob` | 文件模式匹配 |

### 1.2 TDD Red-Green-Refactor 流程

```
RED    → Write failing test
        ↓
GREEN  → Write minimal code to pass
        ↓
REFACTOR → Improve code while keeping tests green
```

**Iron Law:**
```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

### 1.3 Systematic Debugging 4-Phase

```
Phase 1: Root Cause Investigation（必须先完成）
    ↓
Phase 2: Generate Hypotheses
    ↓
Phase 3: Test Hypotheses
    ↓
Phase 4: Implement & Verify Fix
```

---

## 二、OpenClaw 现状对比

| 维度 | Claude Code | OpenClaw | 差距 |
|------|-------------|---------|------|
| 浏览器自动化 | ✅ 完整 | ✅ 有 browser 工具 | 无差距 |
| 终端执行 | ✅ 完整 | ✅ exec | 无差距 |
| TDD 强制 | ✅ Iron Law | ❌ 无 | 需新建 |
| 调试流程 | ✅ 4-Phase | ✅ systematic-debugging | 已迁移 |
| 项目理解 | ✅ context 自动注入 | ❌ 无 | 需新建 |
| 多文件原子编辑 | ✅ Task 原子性 | ❌ 无 | 需新建 |
| Skill 自动触发 | ✅ 5+ tool calls | ❌ 无 | Phase 3 已建 |

---

## 三、蒸馏目标

### 3.1 项目 Context 注入机制

**目标：** 让 AI 在开始编码前自动理解项目上下文

**Claude Code 行为模式：**
1. 扫描项目结构（git, package.json, README 等）
2. 理解项目技术栈
3. 识别入口文件和关键模块
4. 注入相关背景知识

**OpenClaw 适配方案：**

```javascript
// tasks/project-context-injector.js

/**
 * 项目 Context 注入器 v1.0
 * 蒸馏自 Claude Code
 * 
 * 功能：
 * 1. 识别项目类型（Node.js/Python/Go/Rust等）
 * 2. 提取项目元信息（依赖、脚本、入口）
 * 3. 理解项目结构（目录树、关键文件）
 * 4. 注入 context 到下一轮对话
 */

const PROJECT_SIGNATURES = {
  'package.json': 'Node.js',
  'requirements.txt': 'Python',
  'go.mod': 'Go',
  'Cargo.toml': 'Rust',
  'pom.xml': 'Java/Maven',
  'BUILD.bazel': 'Bazel',
  'CMakeLists.txt': 'C++',
};

function detectProjectType(cwd) {
  // 扫描项目签名文件
}

function buildProjectContext(cwd) {
  return {
    type: detectProjectType(cwd),
    structure: scanDirectoryTree(cwd),
    entryPoints: findEntryPoints(cwd),
    scripts: readScripts(cwd),
    dependencies: readDependencies(cwd),
    tests: findTestFiles(cwd),
  };
}
```

### 3.2 多文件原子编辑机制

**目标：** 确保一组相关文件同时更新（原子性）

**问题：** 
- 用户让 AI 修改多个文件
- AI 修改了部分文件后出错
- 结果：部分修改生效，系统处于不一致状态

**Claude Code 解法：**
- Task 作为最小原子单位
- 一组文件变更在 Task 内完成
- 失败则回滚整个 Task

**OpenClaw 适配方案：**

```javascript
// tasks/atomic-file-editor.js

/**
 * 原子文件编辑器 v1.0
 * 蒸馏自 Claude Code Task 机制
 * 
 * 用法：
 * atomicEdit([
 *   { path: 'file1.js', edits: [...] },
 *   { path: 'file2.js', edits: [...] },
 * ], () => {
 *   // 执行编辑
 * });
 */

async function atomicEdit(fileChanges, editFn) {
  const backup = await Promise.all(
    fileChanges.map(f => readFile(f.path))
  );
  
  try {
    await editFn();
  } catch (error) {
    // 回滚所有变更
    await Promise.all(
      fileChanges.map((f, i) => writeFile(f.path, backup[i]))
    );
    throw error;
  }
}
```

### 3.3 TDD 强制执行机制

**目标：** 确保测试先行，代码质量有保障

**流程：**
```
用户需求 → 写测试（RED）→ 跑测试（FAIL）→ 写代码（GREEN）→ 跑测试（PASS）→ REFACTOR
```

**OpenClaw 适配方案：**

```javascript
// tasks/tdd-enforcer.js

/**
 * TDD 强制执行器 v1.0
 * 蒸馏自 Claude Code TDD Iron Law
 * 
 * 检查规则：
 * 1. 写代码前必须先写测试
 * 2. 测试必须先跑通（RED 阶段）
 * 3. 最小代码通过测试即可
 */

const TDD_RULES = `
## TDD 强制规则

### Phase 1: RED
- 先写测试，只写失败测试
- 运行测试确认失败（expected failure）

### Phase 2: GREEN
- 写最小代码让测试通过
- 不要过度设计

### Phase 3: REFACTOR
- 在测试通过的前提下重构
- 保持测试始终通过
`;

function checkTDDCompliance(taskDescription) {
  // 检查是否包含 TDD 相关关键词
  const tddKeywords = ['test', 'spec', '功能', '修复 bug'];
  const hasTestKeyword = tddKeywords.some(k => 
    taskDescription.toLowerCase().includes(k)
  );
  
  if (!hasTestKeyword) {
    return { 
      pass: true, 
      message: 'Non-TDD task, proceed normally' 
    };
  }
  
  // 检查是否先写了测试
  // ... (实际实现需要读取测试文件)
  
  return { pass: true };
}
```

---

## 四、实施计划

| 阶段 | 内容 | 产出物 | 优先级 |
|------|------|--------|--------|
| Phase 4.1 | 项目 Context 注入器 | `tasks/project-context-injector.js` | P0 |
| Phase 4.2 | 原子文件编辑器 | `tasks/atomic-file-editor.js` | P1 |
| Phase 4.3 | TDD 强制执行器 | `tasks/tdd-enforcer.js` | P1 |
| Phase 4.4 | 更新 AGENTS.md | Coding workflow 规则 | P0 |

---

## 五、Coding Workflow 最佳实践

### 5.1 接到编码任务时的标准流程

```
1. [检查] 是否需要加载 skill？
2. [理解] 项目类型和技术栈？
3. [理解] 需求是什么？要修改哪些文件？
4. [规划] 变更计划（列出文件+修改内容）
5. [TDD]  先写测试
6. [执行]  原子性修改文件
7. [验证]  运行测试/构建
8. [交付]  汇报结果
```

### 5.2 多文件修改检查清单

- [ ] 所有相关文件都已识别？
- [ ] 修改顺序正确（无循环依赖）？
- [ ] 有测试覆盖修改的代码？
- [ ] 测试通过？
- [ ] 构建成功？

---

## 六、OpenClaw Coding Skill 建议

**建议新建/增强以下 Skill：**

| Skill | 来源 | 说明 |
|-------|------|------|
| `coding-workflow` | Claude Code | 编码工作流规范 |
| `tdd-workflow` | Claude Code TDD | 测试先行流程 |
| `atomic-edit` | Claude Code Task | 原子性编辑保证 |

---

*Phase 4 蒸馏完成 | 2026-04-21*
