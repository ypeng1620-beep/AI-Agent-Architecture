/**
 * Atomic File Editor v1.0
 * 蒸馏自 Claude Code Task 原子性机制
 * 
 * 功能：
 * 确保一组相关文件同时更新（原子性）
 * 失败时自动回滚所有变更
 * 
 * 使用方式：
 * const result = await atomicEdit([
 *   { path: 'file1.js', oldText: 'xxx', newText: 'yyy' },
 *   { path: 'file2.js', oldText: 'zzz', newText: 'www' },
 * ], () => edit(path, { oldText, newText }));
 */

const fs = require('fs');

/**
 * 读取文件内容
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 写入文件内容
 */
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 执行原子编辑
 * @param {Array} edits - 编辑列表 [{path, oldText, newText}]
 * @param {Function} editFn - 编辑执行函数
 * @returns {Object} {success, results, error}
 */
async function atomicEdit(edits, editFn) {
  // 第一步：备份所有文件
  const backups = [];
  
  for (const edit of edits) {
    try {
      if (fs.existsSync(edit.path)) {
        backups.push({
          path: edit.path,
          content: readFile(edit.path),
          existed: true
        });
      } else {
        backups.push({ path: edit.path, content: null, existed: false });
      }
    } catch (err) {
      // 回滚已备份的文件
      await rollback(backups.slice(0, backups.length));
      return { success: false, error: `备份失败: ${edit.path} - ${err.message}` };
    }
  }
  
  // 第二步：执行编辑
  try {
    const results = await editFn();
    
    // 第三步：验证所有编辑是否成功
    for (const edit of edits) {
      if (fs.existsSync(edit.path)) {
        const content = readFile(edit.path);
        if (edit.newText && !content.includes(edit.newText)) {
          throw new Error(`编辑验证失败: ${edit.path} - 新内容未找到`);
        }
      } else if (edit.existed !== false) {
        throw new Error(`文件丢失: ${edit.path}`);
      }
    }
    
    return { success: true, results };
    
  } catch (err) {
    // 第四步：失败时回滚
    await rollback(backups);
    return { success: false, error: err.message };
  }
}

/**
 * 回滚所有变更
 */
async function rollback(backups) {
  for (const backup of backups) {
    try {
      if (backup.content !== null) {
        writeFile(backup.path, backup.content);
      } else if (backup.existed) {
        fs.unlinkSync(backup.path);
      }
    } catch (err) {
      console.error(`回滚失败: ${backup.path} - ${err.message}`);
    }
  }
}

/**
 * 简化版：直接编辑多个文件
 * @param {Array} changes - [{path, oldText, newText}, ...]
 */
async function editMultipleFiles(changes) {
  const edits = changes.map(c => ({
    path: c.path,
    oldText: c.oldText,
    newText: c.newText
  }));
  
  return atomicEdit(edits, () => {
    for (const edit of edits) {
      if (edit.oldText && edit.newText) {
        const content = readFile(edit.path);
        if (!content.includes(edit.oldText)) {
          throw new Error(`oldText not found in ${edit.path}`);
        }
        writeFile(edit.path, content.replace(edit.oldText, edit.newText));
      } else if (edit.newText) {
        writeFile(edit.path, edit.newText);
      }
    }
    return true;
  });
}

/**
 * 创建新文件（原子操作）
 */
async function atomicCreateFile(filePath, content) {
  return atomicEdit([{ path: filePath, newText: content }], () => {
    writeFile(filePath, content);
    return true;
  });
}

/**
 * 删除文件（原子操作）
 */
async function atomicDeleteFile(filePath) {
  const backup = fs.existsSync(filePath) ? readFile(filePath) : null;
  
  try {
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    // 不自动恢复，需要手动调用 rollbackFromDelete
  }
}

/**
 * 从删除恢复文件
 */
function rollbackFromDelete(filePath, content) {
  if (content !== null) {
    writeFile(filePath, content);
    return { success: true };
  }
  return { success: false, error: '无备份内容' };
}

// CLI 接口
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('用法: node atomic-file-editor.js <file1> <file2> ...');
    process.exit(1);
  }
  
  console.log('Atomic File Editor - 等待编辑指令');
  console.log('请在编辑函数中实现具体逻辑');
}

module.exports = { 
  atomicEdit, 
  editMultipleFiles, 
  atomicCreateFile, 
  atomicDeleteFile,
  rollbackFromDelete,
  readFile,
  writeFile
};
