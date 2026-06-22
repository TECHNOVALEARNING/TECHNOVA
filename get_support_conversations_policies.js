import fs from 'fs';

const schemaPath = 'c:\\Users\\user\\Downloads\\TECHNOVA\\supabase_migrations\\combined_schema.sql';

function getPolicies() {
  const content = fs.readFileSync(schemaPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('policy') && line.toLowerCase().includes('support_conversations')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}

getPolicies();
