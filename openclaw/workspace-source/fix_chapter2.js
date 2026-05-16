const fs = require('fs');
const path = 'D:/AI小说/末世摆烂我白给她/第21章.txt';
let content = fs.readFileSync(path, 'utf8');

const addContent = `

在这个末世，平静的生活是短暂的。

但至少现在，他们还在一起。

这就是最大的幸福。

【未完待续】

---

字数：约5200字
`;

content = content.replace('【未完待续】\n\n---\n\n字数：约5000字', addContent);

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
