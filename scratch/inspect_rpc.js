import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jcfrlevtrnhrmyovmuza.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectFunction() {
  try {
    // Get a real product from the database
    const { data: products, error: pErr } = await supabase.from("products").select("id, creator_id").limit(1);
    if (pErr || !products || products.length === 0) {
      console.error("No products found to test:", pErr);
      return;
    }
    const product = products[0];
    console.log("Using product for test:", product);

    console.log("Calling process_free_order with real product...");
    const { data: res, error: err } = await supabase.rpc("process_free_order", {
      p_name: "Test User",
      p_email: "inspect_test@example.com",
      p_phone: "+22997000000",
      p_product_id: product.id,
      p_store_owner_id: product.creator_id,
      p_promo_code: null,
      p_original_amount: null,
      p_shipping_address: null
    });
    console.log("Response:", JSON.stringify(res));
    console.log("Response Type:", typeof res);
    console.log("Error:", JSON.stringify(err));

    // Clean up created order to not mess up database
    if (res) {
      const orderId = typeof res === 'object' ? (res.order_id || res.id) : res;
      console.log("Attempting to delete test order:", orderId);
      const { error: delErr } = await supabase.from("orders").delete().eq("id", orderId);
      console.log("Delete result:", delErr ? delErr.message : "Success");
    }
  } catch (e) {
    console.error("Exception:", e);
  }
}

inspectFunction();
