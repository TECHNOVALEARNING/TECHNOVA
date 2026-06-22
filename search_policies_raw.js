import fs from 'fs';

const schemaPath = 'c:\\Users\\user\\Downloads\\TECHNOVA\\supabase_migrations\\combined_schema.sql';

function searchPoliciesRaw() {
  const content = fs.readFileSync(schemaPath, 'utf8');
  const lines = content.split('\n');
  
  console.log("Searching for policies containing 'isidore' or 'ancres'...");
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('policy') && (line.toLowerCase().includes('isidore') || line.toLowerCase().includes('ancres'))) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}

searchPoliciesRaw();
