// PawaPay callback handler — receives deposit & payout lifecycle events
// Docs: https://docs.pawapay.io/v2/api-reference/callbacks
// Note: PawaPay does not sign callbacks by default (IP allowlist or shared secret optional).
// We treat callbacks as advisory + always re-fetch status from PawaPay to confirm.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAWAPAY_BASE = "https://api.pawapay.io";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = Deno.env.get("PAWAPAY_API_TOKEN");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const raw = await req.text();
    let body: any;
    try {
      body = JSON.parse(raw);
    } catch {
      return new Response("OK", { status: 200 });
    }

    console.log("[pawapay-callback] received", JSON.stringify(body).slice(0, 500));

    // Determine kind: deposit or payout
    const depositId: string | undefined = body?.depositId;
    const payoutId: string | undefined = body?.payoutId;

    if (!depositId && !payoutId) {
      console.warn("[pawapay-callback] no id in payload");
      return new Response("OK", { status: 200 });
    }

    // Re-fetch from PawaPay for ground truth (security best practice)
    const id = depositId || payoutId!;
    const kind = depositId ? "deposits" : "payouts";
    let tx: any = null;
    try {
      const resp = await fetch(`${PAWAPAY_BASE}/v2/${kind}/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await resp.json();
      tx = Array.isArray(data?.data) ? data.data[0] : data?.data || data;
    } catch (e) {
      console.error("[pawapay-callback] fetch verify failed", e);
      tx = body; // fallback to body
    }

    const status = tx?.status as string | undefined;

    if (depositId) {
      await handleDeposit(supabase, depositId, tx, status);
    } else if (payoutId) {
      await handlePayout(supabase, payoutId, tx, status);
    }

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("[pawapay-callback] error", err);
    // Always 200 to avoid retries flooding
    return new Response("OK", { status: 200 });
  }
});

async function handleDeposit(supabase: any, depositId: string, tx: any, status?: string) {
  const localStatus =
    status === "COMPLETED"
      ? "success"
      : status === "FAILED" || status === "REJECTED"
        ? "failed"
        : "initiated";

  await supabase
    .from("payment_events")
    .update({ status: localStatus })
    .eq("pawapay_deposit_id", depositId);

  if (status !== "COMPLETED") return;

  // PawaPay v2 metadata: array of single-key objects [{customer_id: "..."}, {product_id: "..."}]
  const meta: Record<string, string> = {};
  const metaArr = tx?.metadata || [];
  if (Array.isArray(metaArr)) {
    for (const m of metaArr) {
      if (!m || typeof m !== "object") continue;
      // Support both v2 ({key: value}) and legacy ({fieldName, fieldValue})
      if (m.fieldName && m.fieldValue !== undefined) {
        meta[m.fieldName] = String(m.fieldValue);
      } else {
        for (const [k, v] of Object.entries(m)) {
          if (v !== undefined && v !== null) meta[k] = String(v);
        }
      }
    }
  } else if (metaArr && typeof metaArr === "object") {
    for (const [k, v] of Object.entries(metaArr)) meta[k] = String(v);
  }
  const customerId = meta.customer_id;
  const productId = meta.product_id;
  const storeOwnerId = meta.store_owner_id;
  if (!customerId || !productId || !storeOwnerId) {
    console.warn("[pawapay-callback] missing meta", meta);
    return;
  }

  // Idempotency
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("pawapay_deposit_id", depositId)
    .maybeSingle();
  if (existingOrder) {
    console.log("[pawapay-callback] order exists, skip", depositId);
    return;
  }

  const amount = Number(tx?.amount || tx?.requestedAmount || 0);
  const promoCode = meta.promo_code || null;
  const originalPrice = meta.original_price ? Number(meta.original_price) : null;
  const shippingAddress = meta.shipping_address ? safeJson(meta.shipping_address) : null;

  const { error: orderErr, data: newOrder } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      product_id: productId,
      store_owner_id: storeOwnerId,
      amount,
      status: "completed",
      pawapay_deposit_id: depositId,
      promo_code: promoCode,
      original_amount: originalPrice,
      payment_method: "mobile_money",
      shipping_address: shippingAddress,
    })
    .select("id")
    .single();

  if (orderErr) {
    console.error("[pawapay-callback] order insert error", orderErr);
    return;
  }

  // Fetch product + customer for downstream
  const { data: product } = await supabase
    .from("products")
    .select("title, type, download_url, license_max_activations, license_validity_days")
    .eq("id", productId)
    .single();
  const { data: customer } = await supabase
    .from("customers")
    .select("name, email")
    .eq("id", customerId)
    .single();

  let pendingLicenseKey: string | null = null;
  if (product?.type === "license") {
    pendingLicenseKey = await generateLicense(supabase, {
      productId,
      customerId,
      storeOwnerId,
      orderId: newOrder?.id || null,
      maxActivations: product.license_max_activations || 1,
      validityDays: product.license_validity_days || null,
    });
  }

  // Notification email
  const { data: sellerProfile } = await supabase
    .from("profiles")
    .select("store_slug")
    .eq("id", storeOwnerId)
    .single();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  fetch(`${supabaseUrl}/functions/v1/notify-sale`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store_owner_id: storeOwnerId,
      product_title: product?.title,
      amount,
      customer_name: customer?.name,
      customer_email: customer?.email,
      license_key: pendingLicenseKey,
      license_max_activations: product?.license_max_activations || null,
      license_validity_days: product?.license_validity_days || null,
      product_id: productId,
      download_url: product?.download_url || null,
      product_type: product?.type || null,
      store_slug: sellerProfile?.store_slug || null,
    }),
  }).catch(console.error);

  // Dispatch external webhook
  fetch(`${supabaseUrl}/functions/v1/dispatch-webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "successful.sale",
      store_owner_id: storeOwnerId,
      payload: {
        sale: { amount, currency: tx?.currency || "XOF", transaction_id: depositId },
        product: { id: productId, title: product?.title },
        customer: { name: customer?.name, email: customer?.email },
      },
    }),
  }).catch(console.error);
}

async function handlePayout(supabase: any, payoutId: string, tx: any, status?: string) {
  const newStatus =
    status === "COMPLETED"
      ? "completed"
      : status === "FAILED" || status === "REJECTED"
        ? "failed"
        : "processing";

  const { data: withdrawal } = await supabase
    .from("withdrawals")
    .select("id, user_id, amount, phone_number")
    .eq("pawapay_payout_id", payoutId)
    .maybeSingle();
  if (!withdrawal) return;

  await supabase
    .from("withdrawals")
    .update({
      status: newStatus,
      processed_at: status === "COMPLETED" || status === "FAILED" ? new Date().toISOString() : null,
    })
    .eq("id", withdrawal.id);

  const title =
    status === "COMPLETED"
      ? "Retrait effectué ✅"
      : status === "FAILED" || status === "REJECTED"
        ? "Retrait échoué ❌"
        : "Retrait en cours";
  const message =
    status === "COMPLETED"
      ? `Votre retrait de ${withdrawal.amount} FCFA vers ${withdrawal.phone_number} a été effectué avec succès.`
      : status === "FAILED" || status === "REJECTED"
        ? `Votre retrait de ${withdrawal.amount} FCFA a échoué. Le montant reste disponible.`
        : `Votre retrait est en cours de traitement.`;

  await supabase.from("notifications").insert({
    user_id: withdrawal.user_id,
    title,
    message,
    type:
      status === "COMPLETED"
        ? "success"
        : status === "FAILED" || status === "REJECTED"
          ? "error"
          : "info",
  });
}

async function generateLicense(
  supabase: any,
  p: {
    productId: string;
    customerId: string;
    storeOwnerId: string;
    orderId: string | null;
    maxActivations: number;
    validityDays: number | null;
  },
): Promise<string | null> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    key = "";
    for (let s = 0; s < 4; s++) {
      if (s > 0) key += "-";
      for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const { data: exists } = await supabase
      .from("licenses")
      .select("id")
      .eq("license_key", key)
      .maybeSingle();
    if (!exists) break;
  }
  const { error } = await supabase.from("licenses").insert({
    license_key: key,
    product_id: p.productId,
    customer_id: p.customerId,
    order_id: p.orderId,
    store_owner_id: p.storeOwnerId,
    status: "pending_activation",
    max_activations: p.maxActivations,
    validity_days: p.validityDays,
  });
  if (error) {
    console.error("[pawapay-callback] license insert error", error);
    return null;
  }
  return key;
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
