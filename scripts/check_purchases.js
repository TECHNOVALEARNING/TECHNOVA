import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://jcfrlevtrnhrmyovmuza.supabase.co";
const supabaseServiceKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  const { data, error } = await supabase.from("purchases").select("*").limit(1);
  if (error) {
    console.log("Error querying purchases:", error.message);
  } else {
    console.log("Purchases table exists:", data);
  }
}

checkTables();
