const fs = require('fs');
const path = 'D:\\AI小说\\末世摆烂我白给她\\';

for (let i = 1; i <= 10; i++) {
    const file = path + '第' + i + '章.txt';
    try {
        const content = fs.readFileSync(file, 'utf8');
        // 去掉标题和换行，统计字符数作为近似字数
        const text = content.replace(/[#第章节字\n\s]/g, '');
        console.log(`第${i}章: ${text.length} 字`);
    } catch(e) {
        console.log(`第${i}章: 文件不存在`);
    }
}
