// Nyole Webhook & Callback IPN Handler
// Docs: https://nyole.com/docs/webhooks/evenements/ and https://nyole.com/docs/webhooks/signature/
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-afriflow-signature, x-afriflow-timestamp, x-nyole-signature",
};

async function verifyHmacSignature(rawBody: string, timestamp: string, signatureHeader: string, secret: string): Promise<boolean> {
  try {
    if (!timestamp || !signatureHeader || !secret) return false;
    const parts = signatureHeader.split(",");
    const v1Part = parts.find((p) => p.trim().startsWith("v1="));
    if (!v1Part) return false;
    const receivedSig = v1Part.trim().slice(3);

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const message = encoder.encode(`${timestamp}.${rawBody}`);
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, message);
    const expectedSig = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expectedSig.toLowerCase() === receivedSig.toLowerCase();
  } catch (err) {
    console.error("[nyole-webhook] Signature verification error:", err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const raw = await req.text();
    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    console.log("[nyole-webhook] Notification reçue:", JSON.stringify(payload).slice(0, 500));

    // Vérification de la signature si le secret est configuré
    const webhookSecret =
      Deno.env.get("NYOLE_WEBHOOK_SECRET") || Deno.env.get("NYOLE_API_KEY");
    const timestamp =
      req.headers.get("x-afriflow-timestamp") || req.headers.get("x-nyole-timestamp");
    const signature =
      req.headers.get("x-afriflow-signature") || req.headers.get("x-nyole-signature");

    if (webhookSecret && signature && timestamp) {
      const isValid = await verifyHmacSignature(raw, timestamp, signature, webhookSecret);
      if (!isValid) {
        console.warn("[nyole-webhook] Signature non valide !");
        return new Response("Invalid signature", { status: 401 });
      }
      console.log("[nyole-webhook] Signature vérifiée avec succès.");
    }

    // Récupérer l'identifiant de la commande
    const orderId =
      payload?.data?.metadata?.order_id ||
      payload?.metadata?.order_id ||
      payload?.order_id ||
      payload?.data?.order_id ||
      payload?.reference;

    const event = (payload?.event || payload?.type || "").toLowerCase();
    const status = (
      payload?.status ||
      payload?.data?.status ||
      payload?.data?.state ||
      ""
    ).toUpperCase();

    if (!orderId) {
      console.warn("[nyole-webhook] Aucun order_id trouvé dans le webhook.");
      return new Response(JSON.stringify({ received: true, note: "Missing order_id" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Identifier les statuts de succès selon l'API Nyole
    const isSuccess =
      event === "payment.completed" ||
      event === "checkout.session.completed" ||
      status === "COMPLETED" ||
      status === "SUCCESS" ||
      status === "SUCCESSFUL" ||
      status === "PAID" ||
      payload?.data?.paid === true;

    // Identifier les statuts d'échec
    const isFailed =
      event === "payment.failed" ||
      status === "FAILED" ||
      status === "CANCELLED" ||
      status === "EXPIRED" ||
      status === "REJECTED";

    if (isSuccess) {
      // 1. Récupérer la commande
      const { data: order, error: ordErr } = await supabase
        .from("orders")
        .select("*, products(*)")
        .eq("id", orderId)
        .maybeSingle();

      if (ordErr || !order) {
        console.error("[nyole-webhook] Commande introuvable:", orderId);
        return new Response(JSON.stringify({ received: true, error: "Order not found" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (order.status === "completed") {
        console.log("[nyole-webhook] Commande déjà validée:", orderId);
        return new Response(JSON.stringify({ received: true, status: "Already completed" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 2. Mettre à jour la commande à 'completed'
      await supabase
        .from("orders")
        .update({
          status: "completed",
          payment_method: "Nyole",
        })
        .eq("id", orderId);

      // 3. Récupérer le client
      const { data: customer } = await supabase
        .from("customers")
        .select("name, email, phone")
        .eq("id", order.customer_id)
        .maybeSingle();

      // 4. Mettre à jour le code promo
      if (order.promo_code) {
        const { data: promo } = await supabase
          .from("promo_codes")
          .select("current_uses")
          .eq("code", order.promo_code)
          .eq("creator_id", order.store_owner_id)
          .maybeSingle();

        if (promo) {
          await supabase
            .from("promo_codes")
            .update({ current_uses: (promo.current_uses || 0) + 1 })
            .eq("code", order.promo_code)
            .eq("creator_id", order.store_owner_id);
        }
      }

      // 5. Déclencher notify-sale
      await supabase.functions.invoke("notify-sale", {
        body: {
          store_owner_id: order.store_owner_id,
          product_title: order.products?.title || "Produit TECHNOVA",
          amount: order.amount,
          customer_name: customer?.name || "Client TECHNOVA",
          customer_email: customer?.email || "",
          promo_code: order.promo_code || null,
          original_price: order.original_amount || null,
          product_id: order.product_id,
          download_url: order.products?.download_url || null,
          product_type: order.products?.type || null,
          payment_method: "Nyole",
          order_id: orderId,
        },
      }).catch((e) => console.error("[nyole-webhook] notify-sale error:", e));

      console.log("[nyole-webhook] Commande validée avec succès:", orderId);
    } else if (isFailed) {
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderId);
      console.log("[nyole-webhook] Commande échouée ou annulée:", orderId);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[nyole-webhook] Exception:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
