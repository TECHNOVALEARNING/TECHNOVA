import fs from 'fs';

const schemaPath = 'c:/Users/user/Downloads/TECHNOVA/supabase_migrations/combined_schema.sql';

function getMentions() {
  try {
    if (!fs.existsSync(schemaPath)) {
      console.error("File does not exist!");
      return;
    }
    const content = fs.readFileSync(schemaPath, 'utf16le');
    console.log("File read successfully. Length:", content.length);
    const lines = content.split(/\r?\n/);
    console.log("Total lines:", lines.length);
    
    let count = 0;
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('support_conversations')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
        count++;
      }
    });
    console.log(`Found ${count} lines.`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

getMentions();
