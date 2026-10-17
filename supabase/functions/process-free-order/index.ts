import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeExpectedAmount } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FreeOrderBody {
  customer: { name: string; email: string; phone?: string };
  metadata: {
    product_id: string;
    promo_code?: string | null;
    shipping_address?: any;
    store_slug?: string | null;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as FreeOrderBody;
    if (!body.customer?.email || !body.customer?.name)
      return json({ error: "Client incomplet" }, 400);
    if (!body.metadata?.product_id) return json({ error: "Produit requis" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Le produit, son vendeur et son prix sont lus en base : jamais depuis la requête
    const { data: product } = await admin
      .from("products")
      .select("id, title, price, creator_id, download_url, type")
      .eq("id", body.metadata.product_id)
      .maybeSingle();
    if (!product) return json({ error: "Produit introuvable" }, 404);

    const { expected, original, promoCode } = await computeExpectedAmount(
      admin,
      product,
      body.metadata.promo_code,
    );
    if (expected > 0) {
      return json({ error: "Ce produit n'est pas gratuit." }, 403);
    }

    // Upsert customer
    const email = body.customer.email.trim().toLowerCase();
    const name = body.customer.name.trim();
    const phone = (body.customer.phone || "").replace(/\D/g, "");

    let customerId: string;
    const { data: existing } = await admin
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing?.id) {
      customerId = existing.id;
      await admin
        .from("customers")
        .update({ name, phone: `+${phone}` })
        .eq("id", customerId);
    } else {
      const { data: created, error: createErr } = await admin
        .from("customers")
        .insert({ email, name, phone: `+${phone}` })
        .select("id")
        .single();
      if (createErr) {
        console.error("[process-free-order] customer error", createErr);
        return json({ error: "Impossible d'enregistrer le client" }, 400);
      }
      customerId = created.id;
    }

    // Insert Order
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        customer_id: customerId,
        product_id: product.id,
        store_owner_id: product.creator_id,
        amount: 0,
        status: "completed",
        promo_code: promoCode,
        original_amount: promoCode ? original : null,
        shipping_address: body.metadata.shipping_address || null,
      })
      .select("id")
      .single();

    if (orderErr) throw orderErr;

    // Increment promo usage if any
    if (promoCode) {
      const { data: pd } = await admin
        .from("promo_codes")
        .select("current_uses")
        .eq("code", promoCode)
        .eq("creator_id", product.creator_id)
        .single();
      if (pd) {
        await admin
          .from("promo_codes")
          .update({ current_uses: (pd.current_uses || 0) + 1 })
          .eq("code", promoCode)
          .eq("creator_id", product.creator_id);
      }
    }

    // Call notify-sale using the admin client (données issues de la base)
    await admin.functions.invoke("notify-sale", {
      body: {
        store_owner_id: product.creator_id,
        product_title: product.title || "",
        amount: 0,
        customer_name: name,
        customer_email: email,
        promo_code: promoCode,
        original_price: promoCode ? original : null,
        product_id: product.id,
        download_url: product.download_url || null,
        product_type: product.type || null,
        store_slug: body.metadata.store_slug || null,
        shipping_address: body.metadata.shipping_address || null,
      },
    });

    return json({ success: true, customerId, order_id: order.id });
  } catch (err: any) {
    console.error("[process-free-order] error", err);
    return json({ error: "Erreur serveur" }, 500);
  }

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
