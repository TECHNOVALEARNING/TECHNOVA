const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else {
      const ext = path.extname(fullPath);
      if (['.tsx', '.ts', '.html', '.json', '.md'].includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('Dukaio') || content.includes('dukaio')) {
          content = content.replace(/Dukaio/g, 'TECHNOVA').replace(/dukaio/g, 'technova');
          fs.writeFileSync(fullPath, content);
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done replacing strings.');
