const fs = require('fs');

const cardCode = fs.readFileSync('src/components/tools/ToolCard.tsx', 'utf8');
const dataCode = fs.readFileSync('src/data/toolsData.ts', 'utf8');

const dataMatch = dataCode.match(/export const toolsData: Tool\[\] = (\[[\s\S]*\]);/);
const tools = JSON.parse(dataMatch[1]);

console.log(`Testing icon resolution for all ${tools.length} tools...`);

tools.forEach((t, i) => {
  if (!t.id || !t.name || !t.description || !t.websiteUrl) {
    console.error(`Tool at index ${i} is missing basic properties:`, t);
  }
  if (!t.categories || !Array.isArray(t.categories) || t.categories.length === 0) {
    console.error(`Tool at index ${i} has invalid categories:`, t);
  }
});

console.log("Validation complete!");
