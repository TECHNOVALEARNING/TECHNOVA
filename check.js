const fs = require('fs');
let t = fs.readFileSync('src/data/toolsData.ts', 'utf8');
const start = t.indexOf('id: "antigravity"');
console.log(t.substring(start, start + 300));
