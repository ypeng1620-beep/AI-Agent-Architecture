const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dest = 'D:/AI-Agent-Architecture';

function copyDir(src, dst, excludeDirs) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    let count = 0;
    const items = fs.readdirSync(src, { withFileTypes: true });
    for (const item of items) {
        const srcPath = path.join(src, item.name);
        const dstPath = path.join(dst, item.name);
        if (item.isDirectory()) {
            if (excludeDirs && excludeDirs.includes(item.name)) {
                console.log(`  Skip: ${item.name}`);
                continue;
            }
            count += copyDir(srcPath, dstPath, excludeDirs);
        } else {
            try {
                fs.copyFileSync(srcPath, dstPath);
                count++;
            } catch (e) {
                // ignore errors
            }
        }
    }
    return count;
}

console.log('=== Copying Hermes Agent ===');
try {
    execSync('cmd /c copy "D:\\hermes-agent-main.zip" "D:\\AI-Agent-Architecture\\hermes-agent\\hermes-agent-main.zip"', { stdio: 'inherit' });
    const size = fs.statSync('D:/AI-Agent-Architecture/hermes-agent/hermes-agent-main.zip').size / 1024 / 1024;
    console.log(`Hermes: copied (${size.toFixed(1)} MB)`);
} catch (e) {
    console.log('Hermes: copy failed - trying alternative path');
    // Try alternative hermes paths
}

console.log('\n=== Copying Claude Code src ===');
const claudeSrc = 'D:/Claude-Code-Src/src';
if (fs.existsSync(claudeSrc)) {
    const count = copyDir(claudeSrc, 'D:/AI-Agent-Architecture/claude-code/src', null);
    const readmeSrc = 'D:/Claude-Code-Src/README.md';
    if (fs.existsSync(readmeSrc)) {
        fs.copyFileSync(readmeSrc, 'D:/AI-Agent-Architecture/claude-code/README.md');
    }
    console.log(`Claude Code: copied ${count} files`);
}

console.log('\n=== Copying OpenClaw workspace source ===');
const openclawSrc = 'C:/Users/ypeng/.openclaw/workspace';
const openclawDst = 'D:/AI-Agent-Architecture/openclaw/workspace-source';
const excludeDirs = ['logs', 'completions', 'cache', 'media', 'credentials', 'canvas', 'devices'];

let totalFiles = 0;
let totalSize = 0;

function copyDirFiltered(src, dst) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    let count = 0;
    let size = 0;
    const items = fs.readdirSync(src, { withFileTypes: true });
    for (const item of items) {
        const srcPath = path.join(src, item.name);
        const dstPath = path.join(dst, item.name);
        if (item.isDirectory()) {
            if (excludeDirs.includes(item.name)) continue;
            const [c, s] = copyDirFiltered(srcPath, dstPath);
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
    return [count, size];
}

[totalFiles, totalSize] = copyDirFiltered(openclawSrc, openclawDst);
console.log(`OpenClaw: copied ${totalFiles} files (${(totalSize/1024/1024).toFixed(1)} MB)`);

console.log('\n=== Done ===');
