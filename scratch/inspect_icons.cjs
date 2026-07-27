const fs = require('fs');

const code = fs.readFileSync('scratch/topapps_asset.js', 'utf8');

// Let's search for how icons are imported or exported in the bundle.
// In Lucide React bundles or Vite minified code, icons like Xg, Ry, Dx are React components created by createLucideIcon or lucide icon functions.
// Let's search for icon definitions or icon name strings in topapps_asset.js.

// Find all tool definitions in code with Icon property
const regex = /\{id:"([^"]+)",name:"([^"]+)",description:"([^"]+)",category:"([^"]+)",Icon:([a-zA-Z0-9_$]+)/g;

let match;
const toolIcons = [];

while ((match = regex.exec(code)) !== null) {
  const [full, id, name, description, category, iconVar] = match;
  toolIcons.push({ id, name, category, iconVar });
}

console.log(`Found ${toolIcons.length} tools with iconVar!`);
console.log("Sample 1-10 tool icons:", toolIcons.slice(0, 10));

// Let's find how iconVar is defined in code, e.g. `const Xg = ...` or `Xg=createLucideIcon("FileText",...)` or `Xg=...`
// In lucide-react minified bundles, `createLucideIcon("IconName", ...)` or `["svg", ..., "IconName"]` or similar names exist.
const iconVarNames = new Set(toolIcons.map(t => t.iconVar));
console.log(`Unique icon variables count: ${iconVarNames.size}`);

// Search for definitions of these icon variables in code
const iconMapping = {};

for (const varName of iconVarNames) {
  // Search for pattern like varName = ... "IconName" or varName = c("IconName",...)
  // Lucide React usually defines `const Xg = createLucideIcon("Calculator", ...)` or `Xg = c("Calculator", ...)`
  const searchPattern = new RegExp(`(?:const\\s+)?${varName}\\s*=\\s*(?:[a-zA-Z0-9_$]+\\s*\\(\\s*)?["']([A-Z][a-zA-Z0-9]+)["']`, 'g');
  let m = searchPattern.exec(code);
  if (m) {
    iconMapping[varName] = m[1];
  } else {
    // Try finding string occurrences near varName
    const pos = code.indexOf(`${varName}=`);
    if (pos !== -1) {
      const snippet = code.substring(pos, pos + 150);
      const nameMatch = snippet.match(/["']([A-[a-zA-Z0-9]+)["']/);
      if (nameMatch) {
        iconMapping[varName] = nameMatch[1];
      }
    }
  }
}

console.log("Sample resolved Lucide icon names:", Object.entries(iconMapping).slice(0, 15));

// Map tool IDs to Lucide icon names
const toolToLucideIcon = {};
toolIcons.forEach(t => {
  toolToLucideIcon[t.id] = iconMapping[t.iconVar] || 'Wrench';
});

console.log("Sample tool -> Lucide icon mapping:", Object.entries(toolToLucideIcon).slice(0, 15));

fs.writeFileSync('scratch/tool_lucide_icons.json', JSON.stringify(toolToLucideIcon, null, 2));
