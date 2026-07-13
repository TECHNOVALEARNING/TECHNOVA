import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "../.env.local");

let supabaseUrl = "https://jcfrlevtrnhrmyovmuza.supabase.co";
let supabaseServiceKey = "";

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    if (line.trim().startsWith("#") || !line.includes("=")) continue;
    const [key, ...valParts] = line.split("=");
    const val = valParts.join("=").trim().replace(/^['"]|['"]$/g, "");
    if (key.trim() === "VITE_SUPABASE_URL") {
      supabaseUrl = val;
    }
    if (key.trim() === "SUPABASE_SERVICE_ROLE_KEY" || key.trim() === "VITE_SUPABASE_SERVICE_ROLE_KEY") {
      supabaseServiceKey = val;
    }
  }
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getTableInfo() {
  const { data, error } = await supabase.rpc("execute_sql", {
    query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'store_visits'"
  });

  if (error) {
    // If execute_sql RPC doesn't exist, we can try running it via rest
    console.error("Error with RPC execute_sql:", error.message);
    
    // Let's try fetching columns by query or looking at the schema via postgrest definition
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseServiceKey}`);
    if (res.ok) {
      const swagger = await res.json();
      console.log("Postgrest definition keys for store_visits:", swagger.definitions.store_visits?.properties);
    } else {
      console.log("Failed to fetch Swagger spec:", res.statusText);
    }
  } else {
    console.log("Columns of store_visits:", data);
  }
}

getTableInfo();
