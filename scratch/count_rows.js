import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jcfrlevtrnhrmyovmuza.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function countTableRows() {
  const tables = [
    "orders",
    "products",
    "customers",
    "profiles",
    "withdrawals",
    "wallets",
    "promo_codes"
  ];

  console.log("Checking row counts for key tables:");
  for (const t of tables) {
    try {
      const { count, error } = await supabase
        .from(t)
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.log(`- ${t}: Error (${error.message})`);
      } else {
        console.log(`- ${t}: ${count} rows`);
      }
    } catch (e) {
      console.log(`- ${t}: Exception (${e.message})`);
    }
  }
}

countTableRows();
