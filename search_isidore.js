import fs from 'fs';

const schemaPath = 'c:\\Users\\user\\Downloads\\TECHNOVA\\supabase_migrations\\combined_schema.sql';

function searchIsidore() {
  const content = fs.readFileSync(schemaPath, 'utf16le');
  const lines = content.split('\n');
  
  let found = 0;
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('isidore')) {
      console.log(`\n--- Match at line ${index + 1} ---`);
      const start = Math.max(0, index - 5);
      const end = Math.min(lines.length - 1, index + 5);
      for (let i = start; i <= end; i++) {
        const prefix = i === index ? '>>> ' : '    ';
        console.log(`${prefix}${i + 1}: ${lines[i].trim()}`);
      }
      found++;
    }
  });
  console.log(`Total occurrences found: ${found}`);
}

searchIsidore();
