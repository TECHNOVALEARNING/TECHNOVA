import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jcfrlevtrnhrmyovmuza.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPastOrders() {
  try {
    console.log("Fetching orders with amount = 0...");
    const { data: zeroOrders, error: oErr } = await supabase
      .from("orders")
      .select("id, amount, product_id, promo_code, status, created_at, products(title, price)")
      .eq("amount", 0);

    if (oErr) {
      console.error("Error fetching zero orders:", oErr.message);
      return;
    }

    console.log(`Found ${zeroOrders.length} orders with amount = 0.`);
    
    if (zeroOrders.length === 0) {
      console.log("No orders to fix.");
      return;
    }

    for (const order of zeroOrders) {
      const product = order.products;
      if (!product) {
        console.log(`Order ${order.id}: Product not found, skipping.`);
        continue;
      }

      // Default price is the current product price
      let correctPrice = Number(product.price);

      // If product itself is free, then 0 is the correct price
      if (correctPrice === 0) {
        console.log(`Order ${order.id}: Product "${product.title}" is free (0 FCFA). Already correct.`);
        continue;
      }

      // Check if there was a promo code applied
      if (order.promo_code) {
        console.log(`Order ${order.id}: Promo code "${order.promo_code}" detected for product "${product.title}" (Original: ${correctPrice} FCFA)`);
        // Fetch promo code info
        const { data: promo } = await supabase
          .from("promo_codes")
          .select("discount_percent, discount_amount")
          .eq("code", order.promo_code)
          .maybeSingle();

        if (promo) {
          if (promo.discount_percent) {
            correctPrice = Math.max(0, Math.round(correctPrice * (1 - promo.discount_percent / 100)));
          } else if (promo.discount_amount) {
            correctPrice = Math.max(0, correctPrice - promo.discount_amount);
          }
          console.log(`Calculated price with promo code: ${correctPrice} FCFA`);
        } else {
          console.log("Promo code details not found in database, using full product price.");
        }
      }

      console.log(`Order ${order.id}: Updating amount to ${correctPrice} FCFA (Product: "${product.title}")`);
      
      // Update the order in the database
      const { error: upErr } = await supabase
        .from("orders")
        .update({ amount: correctPrice })
        .eq("id", order.id);

      if (upErr) {
        console.error(`Failed to update order ${order.id}:`, upErr.message);
      } else {
        console.log(`Order ${order.id} updated successfully to ${correctPrice} FCFA.`);
      }
    }

    console.log("Done.");
  } catch (e) {
    console.error("Exception:", e);
  }
}

fixPastOrders();
