const fs = require('fs');

const content = fs.readFileSync('src/data/toolsData.ts', 'utf8');

const matches = content.match(/"iconName":\s*"([^"]+)"/g);

const names = new Set();
if (matches) {
  matches.forEach(m => {
    const name = m.match(/"([^"]+)"/)[1];
    names.add(name);
  });
}

console.log("Total unique iconNames used in toolsData.ts:", names.size);
console.log("Icon names list:", Array.from(names));
