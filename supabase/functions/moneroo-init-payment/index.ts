// Initialize a Moneroo payment and return the hosted checkout URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MONEROO_BASE = "https://api.moneroo.io/v1";

// Moneroo accepte uniquement string|number|boolean dans metadata. Nettoie nulls/undefined/objets.
function sanitizeMetadata(meta: Record<string, any>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(meta || {})) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out[k] = v;
    else out[k] = JSON.stringify(v).slice(0, 500);
  }
  return out;
}

function withOrderReturnUrl(returnUrl: string | undefined, orderId: string): string {
  const base = returnUrl || "https://dukaio.com/payment-callback";
  try {
    const url = new URL(base);
    url.searchParams.set("order_id", orderId);
    return url.toString();
  } catch {
    const joiner = base.includes("?") ? "&" : "?";
    return `${base}${joiner}order_id=${encodeURIComponent(orderId)}`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = Deno.env.get("MONEROO_SECRET_KEY");
    if (!token) return j({ error: "Moneroo non configuré" }, 500);

    const body = await req.json();
    const {
      amount, currency = "XOF", description,
      customer, // { email, first_name, last_name, phone }
      metadata, // { product_id, store_owner_id, ... }
      return_url,
    } = body;

    if (!amount || amount < 100) return j({ error: "Montant minimum 100" }, 400);
    if (!customer?.email) return j({ error: "Email requis" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert customer
    const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || customer.email;
    const { data: cust, error: custErr } = await supabase
      .from("customers")
      .upsert({ name: fullName, phone: customer.phone || "", email: customer.email }, { onConflict: "email" })
      .select("id").single();
    if (custErr) return j({ error: custErr.message }, 400);

    // Create pending order
    const { data: order, error: ordErr } = await supabase
      .from("orders")
      .insert({
        customer_id: cust.id,
        product_id: metadata?.product_id,
        store_owner_id: metadata?.store_owner_id,
        amount,
        status: "pending",
        promo_code: metadata?.promo_code || null,
        original_amount: metadata?.original_price || null,
        shipping_address: metadata?.shipping_address || null,
        payment_method: "moneroo",
      } as any)
      .select("id").single();
    if (ordErr) return j({ error: ordErr.message }, 400);

    const payload = {
      amount: Math.round(Number(amount)),
      currency,
      description: (description || `Achat ${metadata?.product_title || "Dukaio"}`).slice(0, 100),
      customer: {
        email: customer.email,
        first_name: customer.first_name || fullName.split(" ")[0] || "Client",
        last_name: customer.last_name || fullName.split(" ").slice(1).join(" ") || "Dukaio",
        phone: customer.phone || undefined,
      },
      return_url: withOrderReturnUrl(return_url, order.id),
      metadata: sanitizeMetadata({ ...metadata, order_id: order.id }),
    };

    const resp = await fetch(`${MONEROO_BASE}/payments/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    console.log("[moneroo-init-payment]", resp.status, JSON.stringify(data).slice(0, 400));

    if (!resp.ok) {
      const reason = data?.message || data?.error || "Erreur Moneroo";
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return j({ error: reason }, 400);
    }

    const moneroo_id = data?.data?.id;
    const checkout_url = data?.data?.checkout_url;
    if (!checkout_url) return j({ error: "Réponse Moneroo invalide" }, 502);

    await supabase.from("orders").update({ moneroo_transaction_id: moneroo_id }).eq("id", order.id);

    return j({ success: true, order_id: order.id, customer_id: cust.id, customer_name: fullName, moneroo_id, checkout_url });
  } catch (err: any) {
    console.error("[moneroo-init-payment] error", err);
    return j({ error: err.message }, 500);
  }

  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), {
      status: s,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
