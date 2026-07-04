import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jcfrlevtrnhrmyovmuza.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrders() {
  try {
    console.log("Fetching last 20 orders...");
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, amount, status, created_at, product_id, promo_code, products(title, price)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching orders:", error.message);
      return;
    }

    console.log("Orders found in database:");
    orders.forEach(o => {
      console.log(`- ID: ${o.id} | Amount: ${o.amount} | Status: ${o.status} | Product: ${o.products?.title || 'Unknown'} (Price: ${o.products?.price}) | Promo: ${o.promo_code || 'None'} | Date: ${o.created_at}`);
    });
  } catch (e) {
    console.error("Exception:", e);
  }
}

checkOrders();
