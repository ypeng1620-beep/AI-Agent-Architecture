# Obsidian Integration Skill

## 简介
直接读写 Obsidian 笔记库，无需 Obsidian 运行也可操作基础文件。

## 核心配置
- **Vault 路径**: `D:\日记仓库`
- **janiety API**: 需要 Obsidian 运行 + 开启 janiety 插件（默认端口 27123）

## 功能

### 1. 读取笔记
直接读取 vault 中的任意 .md 文件：
```
read("D:\\日记仓库\\openclaw\\笔记名.md")
```

### 2. 写入/更新笔记
创建或覆盖笔记文件：
```
write("D:\\日记仓库\\openclaw\\新笔记.md", "# 标题\n\n内容...")
```

### 3. 搜索笔记
搜索 vault 中包含关键词的文件：
```
Get-ChildItem "D:\日记仓库" -Recurse -Filter "*.md" | Select-String "关键词"
```

### 4. 每日笔记
生成以日期命名的笔记文件：
```
D:\日记仓库\\openclaw\\2026-03-31.md
```

### 5. janiety API（需要 Obsidian 运行）
当 Obsidian 运行时，可通过 REST API 操作：
- GET  http://localhost:27123/api/files - 列出文件
- GET  http://localhost:27123/api/search?q=关键词 - 搜索
- POST http://localhost:27123/api/notes - 创建笔记

## 使用场景

1. **自动记录工作日志** → 写入 Obsidian 每日笔记
2. **知识沉淀** → 将我的复盘、学习成果写入笔记库
3. **双脑联动** → 我负责记忆+分析，Obsidian 负责知识沉淀
4. **老爷查阅** → 直接在 Obsidian 中查看我生成的笔记
