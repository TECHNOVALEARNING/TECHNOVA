import fs from 'fs';

const schemaPath = 'c:\\Users\\user\\Downloads\\TECHNOVA\\supabase_migrations\\combined_schema.sql';

function searchFunctions() {
  const content = fs.readFileSync(schemaPath, 'utf8');
  
  const matches = [];
  const regex = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([a-zA-Z0-9_\.]+)\s*\(/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  
  console.log("Found functions in schema:");
  console.log(JSON.stringify(matches, null, 2));
}

searchFunctions();
