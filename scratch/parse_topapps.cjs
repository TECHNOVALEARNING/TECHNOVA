const fs = require('fs');

const code = fs.readFileSync('scratch/topapps_asset.js', 'utf8');

console.log("File length:", code.length);

// Let's search for objects containing fields like title, name, category, description, url, badge, icon, etc.
// Or inspect regex patterns for objects with id, title, name, etc.

const matches = [];

// Try finding array of tools or items:
// Let's find regex patterns for `{id:...,title:...,...}` or similar objects
const regex = /\{id:"[^"]+",name:"[^"]+"[^}]+\}/g;
const matched = code.match(regex);
console.log("Matched simple name pattern count:", matched ? matched.length : 0);

// Let's try another regex or log snippets
let pos = 0;
const tools = [];

// Let's search for occurrences of tool properties like "category:" or "description:" or "referralCode:"
// In minified Vite code, objects usually look like {id:"...",name:"...",category:"...",...}
// Let's write a parser to find all JSON-like objects in code that look like tool entries.

// Let's search for strings like `title:` or `name:` or `description:` or `slug:`
const allObjRegex = /\{id:"[^"]+",title:"[^"]+-[^}]+\}/g;
const allObjMatched = code.match(allObjRegex);
console.log("Matched title pattern count:", allObjMatched ? allObjMatched.length : 0);

// Let's print out some sample object matches
const sampleRegex = /\{id:[^{}]+?\}/g;
let m;
let count = 0;
while ((m = sampleRegex.exec(code)) !== null) {
  if (m[0].includes('name:') || m[0].includes('title:') || m[0].includes('category:') || m[0].includes('description:')) {
    count++;
    if (count <= 5) {
      console.log(`Sample ${count}:`, m[0].substring(0, 200));
    }
  }
}
console.log(`Total tool-like objects found with id: ${count}`);
