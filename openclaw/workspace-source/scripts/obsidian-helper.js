/**
 * Obsidian 集成工具
 * 路径: D:\日记仓库
 */

const fs = require('fs');
const path = require('path');

const VAULT_PATH = 'D:\\日记仓库';

/**
 * 读取笔记
 */
function readNote(noteName) {
  const filePath = path.join(VAULT_PATH, noteName);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * 写入笔记
 */
function writeNote(noteName, content) {
  const filePath = path.join(VAULT_PATH, noteName);
  fs.writeFileSync(filePath, content, 'utf8');
  return { success: true, path: filePath };
}

/**
 * 创建每日笔记
 */
function createDailyNote(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const filePath = path.join(VAULT_PATH, `${dateStr}.md`);
  
  if (fs.existsSync(filePath)) {
    return { exists: true, path: filePath };
  }
  
  const template = `# ${dateStr} 日记

## 今日目标


## 工作记录


## 学习收获


## 明日计划

`;
  
  fs.writeFileSync(filePath, template, 'utf8');
  return { success: true, path: filePath };
}

/**
 * 追加到每日笔记
 */
function appendToDailyNote(content, date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const filePath = path.join(VAULT_PATH, `${dateStr}.md`);
  
  if (!fs.existsSync(filePath)) {
    createDailyNote(date);
  }
  
  fs.appendFileSync(filePath, `\n${content}`, 'utf8');
  return { success: true, path: filePath };
}

/**
 * 搜索笔记
 */
function searchNotes(keyword) {
  const { execSync } = require('child_process');
  try {
    const result = execSync(
      `powershell -Command "Get-ChildItem 'D:\\日记仓库' -Recurse -Filter '*.md' | Select-String -Pattern '${keyword}' | Select-Object -First 10 Path,LineNumber,Line"`,
      { encoding: 'utf8' }
    );
    return result;
  } catch (e) {
    return null;
  }
}

/**
 * 列出所有笔记
 */
function listNotes(folder = VAULT_PATH) {
  const files = [];
  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.md')) {
        files.push(fullPath.replace('D:\\日记仓库\\', ''));
      }
    }
  }
  walkDir(folder);
  return files;
}

module.exports = {
  readNote,
  writeNote,
  createDailyNote,
  appendToDailyNote,
  searchNotes,
  listNotes,
  VAULT_PATH
};

// 测试
if (require.main === module) {
  console.log('=== Obsidian 集成测试 ===');
  console.log('Vault 路径:', VAULT_PATH);
  console.log('每日笔记测试:', createDailyNote());
  console.log('列出笔记:', listNotes().slice(0, 5));
}
