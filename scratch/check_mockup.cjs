const fs = require('fs');

const srcPath = 'C:/Users/user/.gemini/antigravity-ide/brain/b7f57094-2a7e-4fab-beac-e87c1d4d9e0e/mockup_dashboard_fr_1785169112876.png';
const destPath = 'public/gestcour-mockup.png';

try {
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied mockup image to ${destPath} (size: ${fs.statSync(destPath).size} bytes)`);
  } else {
    console.log(`Source mockup image does not exist at ${srcPath}`);
  }
} catch (e) {
  console.error("Error:", e.message);
}
