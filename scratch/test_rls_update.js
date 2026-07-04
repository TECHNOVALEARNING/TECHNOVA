import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jcfrlevtrnhrmyovmuza.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTk3MDgsImV4cCI6MjA5NjE5NTcwOH0.hvx7Xqt7q54VG5DEu9QtOqEbESbceRpeOMu_9ENVs7s";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function testRls() {
  try {
    // 1. Get real product
    const { data: products } = await adminClient.from("products").select("id, creator_id").limit(1);
    const product = products[0];

    // 2. Create order using process_free_order
    console.log("Creating test order...");
    const { data: res } = await adminClient.rpc("process_free_order", {
      p_name: "Test Buyer",
      p_email: "buyer_test@example.com",
      p_phone: "+22997000000",
      p_product_id: product.id,
      p_store_owner_id: product.creator_id,
      p_promo_code: null,
      p_original_amount: null,
      p_shipping_address: null
    });
    
    const orderId = res.order_id;
    console.log("Order created with ID:", orderId);

    // 3. Try to update this order using the ANON client (as the client-side app does)
    console.log("Attempting to update order amount using ANON client...");
    const { data: updateRes, error: updateErr, status } = await anonClient
      .from("orders")
      .update({
        amount: 5000,
        payment_method: "kkiapay",
        moneroo_transaction_id: "test_tx_123",
        status: "completed"
      })
      .eq("id", orderId)
      .select();

    console.log("Update Response Status:", status);
    console.log("Update Error:", updateErr ? updateErr.message : "None");
    console.log("Update Data returned:", updateRes);

    // 4. Clean up
    await adminClient.from("orders").delete().eq("id", orderId);
    console.log("Cleaned up.");
  } catch (e) {
    console.error("Exception:", e);
  }
}

testRls();
