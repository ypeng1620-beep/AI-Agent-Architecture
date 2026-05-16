const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dest = 'D:/AI-Agent-Architecture';

function copyDir(src, dst, excludeDirs) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    let count = 0;
    let size = 0;
    try {
        const items = fs.readdirSync(src, { withFileTypes: true });
        for (const item of items) {
            const srcPath = path.join(src, item.name);
            const dstPath = path.join(dst, item.name);
            if (item.isDirectory()) {
                if (excludeDirs && excludeDirs.includes(item.name)) continue;
                const [c, s] = copyDir(srcPath, dstPath, excludeDirs);
                count += c;
                size += s;
            } else {
                try {
                    const stat = fs.statSync(srcPath);
                    fs.copyFileSync(srcPath, dstPath);
                    count++;
                    size += stat.size;
                } catch (e) {}
            }
        }
    } catch (e) { console.log('Error reading', src, e.message); }
    return [count, size];
}

console.log('=== Copying Hermes Agent zip ===');
try {
    const hermesSrc = 'D:/hermes-agent-main.zip';
    if (fs.existsSync(hermesSrc)) {
        fs.copyFileSync(hermesSrc, 'D:/AI-Agent-Architecture/hermes-agent/hermes-agent-main.zip');
        const size = fs.statSync(hermesSrc).size / 1024 / 1024;
        console.log('Hermes: copied (' + size.toFixed(1) + ' MB)');
    } else {
        console.log('Hermes zip not at D:/hermes-agent-main.zip');
    }
} catch (e) {
    console.log('Hermes copy error:', e.message);
}

console.log('\n=== Copying Claude Code src ===');
const claudeSrc = 'D:/Claude-Code-Src/src';
if (fs.existsSync(claudeSrc)) {
    const [count] = copyDir(claudeSrc, 'D:/AI-Agent-Architecture/claude-code/src', null);
    const readmeSrc = 'D:/Claude-Code-Src/README.md';
    if (fs.existsSync(readmeSrc)) {
        try { fs.copyFileSync(readmeSrc, 'D:/AI-Agent-Architecture/claude-code/README.md'); } catch(e) {}
    }
    console.log('Claude Code: copied ' + count + ' files');
}

console.log('\n=== Copying OpenClaw workspace source ===');
const openclawSrc = 'C:/Users/ypeng/.openclaw/workspace';
const openclawDst = 'D:/AI-Agent-Architecture/openclaw/workspace-source';
const excludeDirs = ['logs', 'completions', 'cache', 'media', 'credentials', 'canvas', 'devices', 'cron', 'feishu', 'qqbot', 'openclaw-weixin', 'devices', 'browser', 'agents'];

const [totalFiles, totalSize] = copyDir(openclawSrc, openclawDst, excludeDirs);
console.log('OpenClaw: copied ' + totalFiles + ' files (' + (totalSize/1024/1024).toFixed(1) + ' MB)');

console.log('\n=== Done ===');
