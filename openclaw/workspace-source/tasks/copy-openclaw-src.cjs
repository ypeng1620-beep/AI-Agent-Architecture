const fs = require('fs');
const path = require('path');

const src = 'C:/Users/ypeng/.openclaw/workspace';
const dst = 'D:/AI-Agent-Architecture/openclaw/workspace-source';

// Clean first
function deleteRecursive(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
            deleteRecursive(full);
            try { fs.rmdirSync(full); } catch(e) {}
        } else {
            try { fs.unlinkSync(full); } catch(e) {}
        }
    }
}
console.log('Cleaning...');
deleteRecursive(dst);

// Only include essential dirs
const includeDirs = ['.agents', 'distillation', 'docs', 'knowledge', 'memory', 'skills', 'tasks', 'scripts', 'context-bank', 'learn', 'skills-learned'];
const excludeDirs = ['node_modules', 'opencli', 'openclaw-enhancement-ci', 'OpenClaw-Enhancement-Suite', 'ai-agent-guard-ci', 'ai-agent-guard.git', 'daily-paper', 'temp', 'BakeryApp', 'restaurant-pos', 'oes-tmp', 'oes-tmp2', 'stock-simulation', 'skills.bak', 'minimax-output', 'AI-Agent-Guard', 'logs', 'completions', 'cache', 'canvas', 'credentials', 'cron', 'feishu', 'qqbot', 'openclaw-weixin', 'devices', 'browser', 'extensions', 'subagents', 'workspace-chengcai', 'workspace-chengping', 'workspace-restaurant-pos', '~'];

function copyFiltered(srcBase, dstBase) {
    if (!fs.existsSync(dstBase)) fs.mkdirSync(dstBase, { recursive: true });
    let totalFiles = 0;
    let totalSize = 0;
    
    const items = fs.readdirSync(srcBase, { withFileTypes: true });
    for (const item of items) {
        const srcPath = path.join(srcBase, item.name);
        const dstPath = path.join(dstBase, item.name);
        
        if (item.name.startsWith('.')) {
            // Always include hidden dirs that are in includeDirs
            if (!includeDirs.includes(item.name)) continue;
        }
        
        if (excludeDirs.includes(item.name)) {
            console.log('  Exclude: ' + item.name);
            continue;
        }
        
        if (item.isDirectory()) {
            const [f, s] = copyFiltered(srcPath, dstPath);
            totalFiles += f;
            totalSize += s;
        } else {
            try {
                const stat = fs.statSync(srcPath);
                fs.copyFileSync(srcPath, dstPath);
                totalFiles++;
                totalSize += stat.size;
            } catch(e) {}
        }
    }
    return [totalFiles, totalSize];
}

console.log('Copying OpenClaw essential source files...');
const [files, size] = copyFiltered(src, dst);
console.log('Done: ' + files + ' files, ' + (size/1024/1024).toFixed(1) + ' MB');
