const fs = require('fs');

const code = fs.readFileSync('scratch/topapps_asset.js', 'utf8');

// Regex to capture objects having name, description, category, etc.
// In minified code, objects look like:
// {id:"...",name:"...",description:"...",category:"...",...}

const tools = [];

// Match patterns like {id:"...",name:"...",...}
const itemRegex = /\{id:"([^"]+)",name:"([^"]+)",description:"([^"]+)",category:"([^"]+)"([^}]*)\}/g;

let match;
const seen = new Set();

while ((match = itemRegex.exec(code)) !== null) {
  const [full, id, name, description, category, rest] = match;
  if (!seen.has(id)) {
    seen.add(id);

    // Extract rank if present
    const rankMatch = rest.match(/rank:(\d+)/);
    const rank = rankMatch ? parseInt(rankMatch[1]) : 999;

    // Extract url/link or path if present
    const urlMatch = rest.match(/(?:url|link|href|path|website):"([^"]+)"/);
    const url = urlMatch ? urlMatch[1] : `https://topapps.fr/outils/${id}`;

    // Extract badges or tags if present
    const badgeMatch = rest.match(/(?:badge|tag):"([^"]+)"/);
    const badge = badgeMatch ? badgeMatch[1] : undefined;

    tools.push({
      id,
      name,
      description,
      category,
      rank,
      url,
      badge
    });
  }
}

console.log(`Successfully extracted ${tools.length} tools!`);

// Sort by rank ascending if present
tools.sort((a, b) => a.rank - b.rank);

fs.writeFileSync('scratch/all_topapps_tools.json', JSON.stringify(tools, null, 2));
console.log("Saved tools to scratch/all_topapps_tools.json");

// Group by category summary
const catMap = {};
tools.forEach(t => {
  catMap[t.category] = (catMap[t.category] || 0) + 1;
});
console.log("Categories breakdown:", catMap);
