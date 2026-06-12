import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FreeOrderBody {
  customer: { name: string; email: string; phone: string };
  metadata: {
    product_id: string;
    product_title?: string;
    store_owner_id: string;
    promo_code?: string | null;
    original_price?: number | null;
    shipping_address?: any;
    download_url?: string | null;
    product_type?: string | null;
    store_slug?: string | null;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as FreeOrderBody;
    if (!body.customer?.email || !body.customer?.name) return json({ error: "Client incomplet" }, 400);
    if (!body.metadata?.product_id || !body.metadata?.store_owner_id)
      return json({ error: "Produit requis" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert customer
    const email = body.customer.email.trim().toLowerCase();
    const name = body.customer.name.trim();
    const phone = body.customer.phone.replace(/\D/g, "");

    let customerId: string;
    const { data: existing } = await admin
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing?.id) {
      customerId = existing.id;
      await admin.from("customers").update({ name, phone: `+${phone}` }).eq("id", customerId);
    } else {
      const { data: created, error: createErr } = await admin
        .from("customers")
        .insert({ email, name, phone: `+${phone}` })
        .select("id")
        .single();
      if (createErr) return json({ error: `Client: ${createErr.message}` }, 400);
      customerId = created.id;
    }

    // Insert Order
    const { error: orderErr } = await admin.from("orders").insert({
      customer_id: customerId,
      product_id: body.metadata.product_id,
      store_owner_id: body.metadata.store_owner_id,
      amount: 0,
      status: "completed",
      promo_code: body.metadata.promo_code || null,
      original_amount: body.metadata.original_price || null,
      shipping_address: body.metadata.shipping_address || null,
    });

    if (orderErr) throw orderErr;

    // Increment promo usage if any
    if (body.metadata.promo_code) {
      const { data: pd } = await admin.from("promo_codes").select("current_uses")
        .eq("code", body.metadata.promo_code).eq("creator_id", body.metadata.store_owner_id).single();
      if (pd) {
        await admin.from("promo_codes").update({ current_uses: (pd.current_uses || 0) + 1 })
          .eq("code", body.metadata.promo_code).eq("creator_id", body.metadata.store_owner_id);
      }
    }

    // Call notify-sale using the admin client
    await admin.functions.invoke("notify-sale", {
      body: {
        store_owner_id: body.metadata.store_owner_id,
        product_title: body.metadata.product_title || "",
        amount: 0,
        customer_name: name,
        customer_email: email,
        promo_code: body.metadata.promo_code || null,
        original_price: body.metadata.original_price || null,
        product_id: body.metadata.product_id,
        download_url: body.metadata.download_url || null,
        product_type: body.metadata.product_type || null,
        store_slug: body.metadata.store_slug || null,
        shipping_address: body.metadata.shipping_address || null,
      }
    });

    return json({ success: true, customerId });
  } catch (err: any) {
    console.error("[process-free-order] error", err);
    return json({ error: err.message || "Erreur serveur" }, 500);
  }

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
