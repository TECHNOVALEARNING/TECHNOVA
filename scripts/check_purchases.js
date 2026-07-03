import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://jcfrlevtrnhrmyovmuza.supabase.co";
const supabaseServiceKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

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
