import fs from 'fs';

const schemaPath = 'c:\\Users\\user\\Downloads\\TECHNOVA\\supabase_migrations\\combined_schema.sql';

function searchPolicies() {
  const content = fs.readFileSync(schemaPath, 'utf8');
  
  const matches = [];
  const regex = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_\.]+)\s+[^;]+;/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[0].toLowerCase().includes('isidore') || match[0].toLowerCase().includes('email')) {
      matches.push(match[0]);
    }
  }
  
  console.log("Found policies matching 'isidore' or 'email':");
  console.log(JSON.stringify(matches, null, 2));
}

searchPolicies();
