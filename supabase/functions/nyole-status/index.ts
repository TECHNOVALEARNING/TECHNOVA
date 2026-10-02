// Check status of a Nyole checkout session
// Endpoint: GET https://app.nyole.com/api/v1/checkout/sessions/{id}/status
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

    const sessionId = body.session_id || body.reference || body.id;
    const orderId = body.order_id;

    if (!sessionId && !orderId) {
      return jsonResponse({ error: "session_id ou order_id requis" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Si on a l'order_id, vérifier d'abord en local dans la base
    if (orderId) {
      const { data: localOrder } = await supabase
        .from("orders")
        .select("id, status, amount, pawapay_deposit_id, store_owner_id, product_id, promo_code, original_amount")
        .eq("id", orderId)
        .maybeSingle();

      if (localOrder?.status === "completed") {
        return jsonResponse({
          status: "SUCCESS",
          paid: true,
          local: true,
          order_id: orderId,
        });
      }
    }

    // 2. Interroger l'API Nyole si sessionId disponible
    if (sessionId) {
      const cleanBase = baseUrl.replace(/\/+$/, "");
      const res = await fetch(`${cleanBase}/checkout/sessions/${sessionId}/status`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const nyoleData = await res.json();
        const isSuccess =
          nyoleData.paid === true ||
          nyoleData.status === "SUCCESS" ||
          nyoleData.status === "COMPLETED";

        const isFailed =
          nyoleData.status === "FAILED" ||
          nyoleData.status === "CANCELLED" ||
          nyoleData.status === "EXPIRED";

        // Si le paiement est réussi, mettre à jour la commande en base si besoin
        if (isSuccess && orderId) {
          const { data: currentOrder } = await supabase
            .from("orders")
            .select("*, products(*), customers(*)")
            .eq("id", orderId)
            .maybeSingle();

          if (currentOrder && currentOrder.status !== "completed") {
            await supabase
              .from("orders")
              .update({
                status: "completed",
                payment_method: "Nyole",
              })
              .eq("id", orderId);

            // Mettre à jour code promo si présent
            if (currentOrder.promo_code) {
              const { data: promo } = await supabase
                .from("promo_codes")
                .select("current_uses")
                .eq("code", currentOrder.promo_code)
                .eq("creator_id", currentOrder.store_owner_id)
                .maybeSingle();

              if (promo) {
                await supabase
                  .from("promo_codes")
                  .update({ current_uses: (promo.current_uses || 0) + 1 })
                  .eq("code", currentOrder.promo_code)
                  .eq("creator_id", currentOrder.store_owner_id);
              }
            }

            // Déclencher notify-sale
            await supabase.functions.invoke("notify-sale", {
              body: {
                store_owner_id: currentOrder.store_owner_id,
                product_title: currentOrder.products?.title || "Produit TECHNOVA",
                amount: currentOrder.amount,
                customer_name: currentOrder.customers?.name || "Client TECHNOVA",
                customer_email: currentOrder.customers?.email || "",
                promo_code: currentOrder.promo_code || null,
                original_price: currentOrder.original_amount || null,
                product_id: currentOrder.product_id,
                download_url: currentOrder.products?.download_url || null,
                product_type: currentOrder.products?.type || null,
                payment_method: "Nyole",
                order_id: orderId,
              },
            }).catch((e) => console.error("[nyole-status] notify-sale error:", e));
          }
        } else if (isFailed && orderId) {
          await supabase
            .from("orders")
            .update({ status: "failed" })
            .eq("id", orderId);
        }

        return jsonResponse({
          ...nyoleData,
          status: isSuccess ? "SUCCESS" : nyoleData.status,
          paid: isSuccess,
        });
      }
    }

    // Récupérer le statut actuel en base
    if (orderId) {
      const { data: localOrder } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .maybeSingle();

      const st = (localOrder?.status || "pending").toUpperCase();
      return jsonResponse({
        status: st === "COMPLETED" ? "SUCCESS" : st,
        paid: st === "COMPLETED",
      });
    }

    return jsonResponse({ status: "PENDING", paid: false });
  } catch (error: any) {
    console.error("[nyole-status] Exception:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});
