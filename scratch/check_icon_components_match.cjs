const fs = require('fs');

const cardCode = fs.readFileSync('src/components/tools/ToolCard.tsx', 'utf8');
const dataCode = fs.readFileSync('src/data/toolsData.ts', 'utf8');

const dataMatch = dataCode.match(/export const toolsData: Tool\[\] = (\[[\s\S]*\]);/);
const tools = JSON.parse(dataMatch[1]);

// Extract keys in iconComponents map from ToolCard.tsx
const iconMapMatch = cardCode.match(/const iconComponents:[^{]+\{([^}]+)\};/);
if (!iconMapMatch) {
  console.error("Could not parse iconComponents in ToolCard.tsx");
  process.exit(1);
}

const mapKeys = iconMapMatch[1]
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(s => s.split(':')[0].trim());

const iconKeysSet = new Set(mapKeys);
console.log("Registered iconComponent keys in ToolCard.tsx:", Array.from(iconKeysSet));

const missing = [];
tools.forEach(t => {
  if (t.iconName && !iconKeysSet.has(t.iconName)) {
    missing.push({ id: t.id, name: t.name, iconName: t.iconName });
  }
});

if (missing.length > 0) {
  console.error(`Found ${missing.length} missing iconNames in ToolCard.tsx:`, missing.slice(0, 15));
} else {
  console.log("ALL 290 tools' iconNames exist in ToolCard.tsx!");
}
