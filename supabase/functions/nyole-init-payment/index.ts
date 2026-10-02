// Initialize a checkout session via Nyole API
// Endpoint: POST https://app.nyole.com/api/v1/checkout/sessions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const apiKey =
      Deno.env.get("NYOLE_API_KEY") ||
      body.apiKey ||
      "af_live_pub_d06f8f992bc452befbc49b7409d257eed7c2a4726ba0a09a";

    let baseUrl =
      Deno.env.get("NYOLE_BASE_URL") ||
      body.baseUrl ||
      "https://app.nyole.com/api/v1";

    if (baseUrl.includes("api.nyole.com")) {
      baseUrl = "https://app.nyole.com/api/v1";
    }

    const {
      amount,
      currency = "XOF",
      description,
      customer, // { name, email, phone }
      metadata, // { product_id, store_owner_id, promo_code, original_price, shipping_address }
      return_url,
      cancel_url,
      order_id: existingOrderId,
    } = body;

    if (!amount || amount <= 0) {
      return jsonResponse({ error: "Montant invalide ou manquant." }, 400);
    }
    if (!customer?.email) {
      return jsonResponse({ error: "Email client requis." }, 400);
    }
    if (!metadata?.product_id || !metadata?.store_owner_id) {
      return jsonResponse({ error: "Identifiant produit ou vendeur manquant." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Enregistrer ou mettre à jour le client
    const email = customer.email.trim().toLowerCase();
    const name = (customer.name || "").trim() || email;
    const phone = customer.phone ? customer.phone.replace(/[^\d+]/g, "") : "";

    const { data: cust, error: custErr } = await supabase
      .from("customers")
      .upsert(
        { name, phone, email },
        { onConflict: "email" },
      )
      .select("id")
      .single();

    if (custErr) {
      console.error("[nyole-init] Erreur client:", custErr);
    }

    // 2. Récupérer ou créer la commande
    let orderId = existingOrderId;

    if (!orderId) {
      const { data: order, error: ordErr } = await supabase
        .from("orders")
        .insert({
          customer_id: cust?.id || null,
          product_id: metadata.product_id,
          store_owner_id: metadata.store_owner_id,
          amount: Math.round(amount),
          original_amount: metadata.original_price ? Math.round(metadata.original_price) : null,
          promo_code: metadata.promo_code || null,
          shipping_address: metadata.shipping_address || null,
          status: "pending",
          payment_method: "Nyole",
        })
        .select("id")
        .single();

      if (ordErr || !order) {
        console.error("[nyole-init] Erreur création commande:", ordErr);
        return jsonResponse({ error: "Échec de création de la commande." }, 500);
      }
      orderId = order.id;
    } else {
      // Mettre à jour l'ordre existant
      await supabase
        .from("orders")
        .update({
          amount: Math.round(amount),
          payment_method: "Nyole",
          status: "pending",
        })
        .eq("id", orderId);
    }

    // 3. Préparer le payload selon l'API officielle Nyole
    const sessionPayload = {
      amount: Math.round(amount),
      currency: (currency || "XOF").toUpperCase(),
      customer_name: name,
      customer_email: email,
      customer_phone: phone.startsWith("+") ? phone : (phone ? `+${phone}` : undefined),
      description: description || `Commande #${orderId.slice(0, 8)} - TECHNOVA`,
      success_url: return_url || `https://technova.com/buyer-login?payment=success&order_id=${orderId}`,
      cancel_url: cancel_url || `https://technova.com/product/${metadata.product_id}`,
      metadata: {
        order_id: orderId,
        product_id: metadata.product_id,
        store_owner_id: metadata.store_owner_id,
        promo_code: metadata.promo_code || null,
        original_price: metadata.original_price || null,
        platform: "TECHNOVA",
      },
      merchant_name: "TECHNOVA",
    };

    console.log("[nyole-init] Appel Nyole session:", `${baseUrl.replace(/\/+$/, "")}/checkout/sessions`);

    // 4. Appel de l'API Nyole
    const nyoleResponse = await fetch(`${baseUrl.replace(/\/+$/, "")}/checkout/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
        "Idempotency-Key": `order-${orderId}`,
      },
      body: JSON.stringify(sessionPayload),
    });

    const nyoleData = await nyoleResponse.json().catch(() => null);

    if (!nyoleResponse.ok || !nyoleData?.url) {
      console.error("[nyole-init] Erreur réponse Nyole:", nyoleData);
      return jsonResponse({
        error: nyoleData?.message || nyoleData?.error || "Erreur de création de session Nyole.",
        details: nyoleData,
      }, nyoleResponse.status || 500);
    }

    // Enregistrer l'ID de session Nyole dans la commande (colonne pawapay_deposit_id ou moneroo_transaction_id)
    await supabase
      .from("orders")
      .update({
        pawapay_deposit_id: nyoleData.id,
        payment_method: "Nyole",
      })
      .eq("id", orderId);

    return jsonResponse({
      success: true,
      order_id: orderId,
      session_id: nyoleData.id,
      checkout_url: nyoleData.url,
      reference: nyoleData.order_id,
      data: nyoleData,
    });
  } catch (error: any) {
    console.error("[nyole-init] Exception:", error);
    return jsonResponse({ error: error.message || "Erreur interne du serveur." }, 500);
  }
});
