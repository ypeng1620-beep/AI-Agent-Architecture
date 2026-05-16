const fs = require('fs');
const path = require('path');

function getDirInfo(dir, indent) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    let totalSize = 0;
    let totalFiles = 0;
    let output = '';
    
    for (const item of items) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
            const [size, files, subOut] = getDirInfo(full, indent + '  ');
            totalSize += size;
            totalFiles += files;
            if (files > 0) {
                output += indent + item.name + '/ (' + files + ' files, ' + (size/1024/1024).toFixed(1) + ' MB)\n';
                output += subOut;
            }
        } else {
            try {
                const stat = fs.statSync(full);
                totalSize += stat.size;
                totalFiles++;
            } catch(e) {}
        }
    }
    return [totalSize, totalFiles, output];
}

const base = 'D:/AI-Agent-Architecture';
const subdirs = fs.readdirSync(base);

for (const sub of subdirs) {
    const full = path.join(base, sub);
    if (fs.statSync(full).isDirectory()) {
        const [size, files, subOut] = getDirInfo(full, '  ');
        console.log(sub + '/ (' + files + ' files, ' + (size/1024/1024).toFixed(1) + ' MB)');
        console.log(subOut || '  (empty or all excluded)\n');
    } else {
        const stat = fs.statSync(full);
        console.log(sub + ' (' + (stat.size/1024/1024).toFixed(1) + ' MB)');
    }
}
