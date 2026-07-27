const fs = require('fs');

const content = fs.readFileSync('src/data/toolsData.ts', 'utf8');

// Parse toolsData array
const match = content.match(/export const toolsData: Tool\[\] = (\[[\s\S]*\]);/);
if (!match) {
  console.error("Could not parse toolsData array!");
  process.exit(1);
}

try {
  const tools = JSON.parse(match[1]);
  console.log(`Parsed ${tools.length} tools!`);

  let invalidCount = 0;
  tools.forEach((t, idx) => {
    if (!t.id || !t.name || !t.description || !t.categories || !Array.isArray(t.categories)) {
      console.error(`Invalid tool at index ${idx}:`, t);
      invalidCount++;
    }
  });

  if (invalidCount === 0) {
    console.log("ALL tools are 100% valid!");
  } else {
    console.error(`Found ${invalidCount} invalid tools!`);
  }
} catch (err) {
  console.error("JSON parse error:", err.message);
}
