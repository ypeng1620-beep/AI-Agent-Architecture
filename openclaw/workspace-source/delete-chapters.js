const fs = require('fs');
const path = 'D:\\AI小说\\末世摆烂我白给她\\';
const chapters = [598,599,600,601,602,603,604,605,606,607,608,609];

chapters.forEach(i => {
    const file = path + '第' + i + '章.txt';
    try {
        fs.unlinkSync(file);
        console.log('Deleted:', file);
    } catch(e) {
        console.log('Not found:', file);
    }
});
