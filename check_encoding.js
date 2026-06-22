import fs from 'fs';

const schemaPath = 'c:/Users/user/Downloads/TECHNOVA/supabase_migrations/combined_schema.sql';

function check() {
  const buf = fs.readFileSync(schemaPath);
  console.log("First 10 bytes (hex):", buf.slice(0, 10).toString('hex'));
  
  // Try reading as UTF-16LE
  const utf16Str = buf.toString('utf16le');
  console.log("First 100 chars (UTF-16LE):", utf16Str.substring(0, 100));
  
  // Try reading as UTF-8
  const utf8Str = buf.toString('utf8');
  console.log("First 100 chars (UTF-8):", utf8Str.substring(0, 100));
}

check();
