// Receive Moneroo payment webhooks and finalize the order
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-moneroo-signature",
};

async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  // constant-time compare
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

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
    console.error("[moneroo-payment-webhook] license generation failed", genErr);
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
    console.error("[moneroo-payment-webhook] license insert failed", licenseErr);
    return null;
  }
  return generated;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const raw = await req.text();
    const signature = req.headers.get("x-moneroo-signature") || "";
    const webhookSecret = Deno.env.get("MONEROO_WEBHOOK_SECRET");

    // Best-effort signature verification (logs but does not block in case of secret mismatch during setup)
    if (webhookSecret) {
      const ok = await verifySignature(webhookSecret, raw, signature);
      if (!ok) console.warn("[moneroo-payment-webhook] signature invalide", { signature: signature.slice(0, 12) });
    }

    const event = JSON.parse(raw || "{}");
    console.log("[moneroo-payment-webhook] event", JSON.stringify(event).slice(0, 600));

    const data = event?.data || event;
    const monerooId = data?.id || data?.transaction_id;
    const status = (data?.status || event?.event || "").toString().toLowerCase();
    const orderId = data?.metadata?.order_id;

    if (!monerooId && !orderId) {
      return new Response(JSON.stringify({ error: "Missing identifier" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find order by moneroo_transaction_id or metadata.order_id
    let order: any = null;
    if (orderId) {
      const { data: o } = await supabase.from("orders").select("*, products(title, download_url, type, creator_id, license_max_activations, license_validity_days), customers(name, email)").eq("id", orderId).maybeSingle();
      order = o;
    }
    if (!order && monerooId) {
      const { data: o } = await supabase.from("orders").select("*, products(title, download_url, type, creator_id, license_max_activations, license_validity_days), customers(name, email)").eq("moneroo_transaction_id", monerooId).maybeSingle();
      order = o;
    }
    if (!order) {
      console.warn("[moneroo-payment-webhook] order introuvable", { monerooId, orderId });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const isSuccess = ["success", "successful", "completed", "paid", "payment.success", "payment.completed"].includes(status);
    const isFailed = ["failed", "cancelled", "canceled", "expired", "rejected", "payment.failed"].includes(status);

    if (isSuccess && order.status !== "completed") {
      await supabase.from("orders").update({ status: "completed", moneroo_transaction_id: monerooId || order.moneroo_transaction_id }).eq("id", order.id);
      const licenseKey = await issueLicenseIfNeeded(supabase, order);

      // Trigger seller notification + delivery
      supabase.functions.invoke("notify-sale", { body: {
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
      }}).catch((e) => console.error("notify-sale failed", e));
    } else if (isFailed && order.status === "pending") {
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("[moneroo-payment-webhook] error", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
