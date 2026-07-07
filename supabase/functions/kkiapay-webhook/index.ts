// Receive KKiaPay payment webhooks and finalize/register the order in the database
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-kkiapay-secret",
};

async function issueLicenseIfNeeded(supabase: any, order: any) {
  const product = order.products;
  if (!product || product.type !== "license") return null;

  const { data: existing } = await supabase
    .from("licenses")
    .select("license_key")
    .eq("order_id", order.id)
    .maybeSingle();
  if (existing?.license_key) return existing.license_key;

  const { data: generated, error: genErr } = await supabase.rpc("generate_license_key");
  if (genErr || !generated) {
    console.error("[kkiapay-webhook] license generation failed", genErr);
    return null;
  }

  const { error: licenseErr } = await supabase.from("licenses").insert({
    license_key: generated,
    product_id: order.product_id,
    customer_id: order.customer_id,
    order_id: order.id,
    store_owner_id: order.store_owner_id,
    status: "pending_activation",
    max_activations: product.license_max_activations || 1,
    validity_days: product.license_validity_days || null,
  });

  if (licenseErr) {
    console.error("[kkiapay-webhook] license insert failed", licenseErr);
    return null;
  }
  return generated;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const raw = await req.text();
    const receivedSecret = req.headers.get("x-kkiapay-secret") || "";
    const webhookSecret = Deno.env.get("KKIAPAY_WEBHOOK_SECRET");

    if (webhookSecret && receivedSecret !== webhookSecret) {
      console.error("[kkiapay-webhook] unauthorized: secret mismatch");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(raw || "{}");
    console.log("[kkiapay-webhook] payload received:", JSON.stringify(payload).slice(0, 800));

    const status = payload.status;
    const transactionId = payload.transactionId;

    if (!transactionId) {
      return new Response(JSON.stringify({ error: "Missing transactionId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Parse custom metadata from payload.data
    let customData: any = {};
    if (payload.data) {
      try {
        customData = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data;
      } catch (e) {
        console.error("[kkiapay-webhook] failed to parse custom data:", e);
      }
    }

    const productId = customData.product_id;
    const customerEmail = customData.customer_email || payload.client?.email;
    const customerName = customData.customer_name || payload.client?.fullname || "Client KkiaPay";
    const customerPhone = customData.customer_phone || payload.client?.phone || "+1234567890";
    const promoCode = customData.promo_code || null;
    const originalAmount = customData.original_amount || null;
    const shippingAddress = customData.shipping_address || null;
    const discountedPrice = customData.discounted_price || payload.amount || 0;
    const storeOwnerId = customData.store_owner_id;

    if (status === "SUCCESS") {
      // 1. Check if the order was already created
      const { data: existingOrder } = await supabase
        .from("orders")
        .select(
          "*, products(title, download_url, type, creator_id, license_max_activations, license_validity_days), customers(name, email)",
        )
        .eq("moneroo_transaction_id", transactionId)
        .maybeSingle();

      let order = existingOrder;

      if (!order) {
        console.log("[kkiapay-webhook] Order not found, creating a new order...");
        // 2. Call process_free_order RPC to register the order
        const { data: rpcData, error: rpcErr } = await supabase.rpc("process_free_order", {
          p_name: customerName,
          p_email: customerEmail,
          p_phone: customerPhone,
          p_product_id: productId,
          p_store_owner_id: storeOwnerId,
          p_promo_code: promoCode,
          p_original_amount: originalAmount,
          p_shipping_address: shippingAddress,
        });

        if (rpcErr || !rpcData?.order_id) {
          throw new Error(
            "Failed to create order via RPC: " + (rpcErr?.message || "No order ID returned"),
          );
        }

        // Fetch the newly created order
        const { data: newOrder } = await supabase
          .from("orders")
          .select(
            "*, products(title, download_url, type, creator_id, license_max_activations, license_validity_days), customers(name, email)",
          )
          .eq("id", rpcData.order_id)
          .maybeSingle();

        order = newOrder;

        // 3. Update the order with Kkiapay transaction ID, completed status, and amount
        if (order) {
          await supabase
            .from("orders")
            .update({
              status: "completed",
              moneroo_transaction_id: transactionId,
              amount: discountedPrice,
              payment_method: "KkiaPay",
            })
            .eq("id", order.id);

          order.amount = discountedPrice;
          order.payment_method = "KkiaPay";
          order.status = "completed";
        }
      } else if (order.status !== "completed") {
        // Update to completed if it exists but wasn't marked complete
        await supabase
          .from("orders")
          .update({
            status: "completed",
            amount: discountedPrice,
            payment_method: "KkiaPay",
          })
          .eq("id", order.id);

        order.status = "completed";
      }

      if (order && order.status === "completed") {
        // 4. Issue license if needed
        const licenseKey = await issueLicenseIfNeeded(supabase, order);

        // 5. Trigger notify-sale edge function for fulfillment
        await supabase.functions.invoke("notify-sale", {
          body: {
            store_owner_id: order.store_owner_id,
            product_title: order.products?.title,
            amount: order.amount,
            customer_name: order.customers?.name,
            customer_email: order.customers?.email,
            product_id: order.product_id,
            download_url: order.products?.download_url,
            product_type: order.products?.type,
            license_key: licenseKey,
            license_max_activations: order.products?.license_max_activations || null,
            license_validity_days: order.products?.license_validity_days || null,
            promo_code: order.promo_code,
            original_price: order.original_amount,
            shipping_address: order.shipping_address,
            payment_method: "KkiaPay",
            order_id: order.id,
          },
        });

        console.log("[kkiapay-webhook] fulfillment succeeded for order:", order.id);
      }
    } else if (status === "FAILED") {
      // Mark order as failed if it exists and is pending
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("moneroo_transaction_id", transactionId)
        .maybeSingle();

      if (existingOrder && existingOrder.status === "pending") {
        await supabase.from("orders").update({ status: "failed" }).eq("id", existingOrder.id);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[kkiapay-webhook] Error processing webhook:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
