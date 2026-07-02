import fs from "fs";

const schemaPath = "c:\\Users\\user\\Downloads\\TECHNOVA\\supabase_migrations\\combined_schema.sql";

function printAllPolicies() {
  const content = fs.readFileSync(schemaPath, "utf8");
  const lines = content.split("\n");

  let count = 0;
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes("policy")) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
      count++;
    }
  });
  console.log(`Total policy lines found: ${count}`);
}

printAllPolicies();
