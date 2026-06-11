import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...body } = await req.json();
    const MONEYFUSION_API_URL = Deno.env.get("MONEYFUSION_API_URL");

    if (!MONEYFUSION_API_URL) {
      return new Response(
        JSON.stringify({ error: "MoneyFusion API URL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    if (action === "initialize") {
      const { amount, customer, metadata, return_url } = body;

      const email = customer?.email?.trim()?.toLowerCase();
      const name = customer?.name?.trim();
      const phone = customer?.phone?.trim();

      if (!amount || !email || !name || !phone || !metadata?.product_id || !metadata?.store_owner_id || !return_url) {
        return new Response(
          JSON.stringify({ error: "Paramètres de paiement incomplets" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // MoneyFusion requires minimum 200 FCFA
      if (Number(amount) < 200) {
        return new Response(
          JSON.stringify({ error: "Le montant minimum de paiement est de 200 FCFA" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create or update customer server-side
      let customerId: string;
      const { data: existingCustomer, error: existingError } = await admin
        .from("customers")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingError) {
        return new Response(
          JSON.stringify({ error: `Erreur client: ${existingError.message}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (existingCustomer?.id) {
        customerId = existingCustomer.id;
        await admin.from("customers").update({ name, phone }).eq("id", customerId);
      } else {
        const { data: newCustomer, error: createError } = await admin
          .from("customers")
          .insert({ email, name, phone })
          .select("id")
          .single();

        if (createError) {
          return new Response(
            JSON.stringify({ error: `Erreur création client: ${createError.message}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        customerId = newCustomer.id;
      }

      // Build webhook URL for MoneyFusion payin events
      const webhookUrl = `${supabaseUrl}/functions/v1/moneyfusion-webhook`;

      // Build return URL with token placeholder (will be replaced after response)
      const cleanPhone = phone.replace(/\s+/g, "");

      // Call MoneyFusion Payin API
      const res = await fetch(MONEYFUSION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalPrice: Math.round(Number(amount)),
          article: [{ [metadata.product_title || "Produit"]: Math.round(Number(amount)) }],
          personal_Info: [{
            customer_id: customerId,
            product_id: metadata.product_id,
            store_owner_id: metadata.store_owner_id,
            promo_code: metadata.promo_code || null,
            original_price: metadata.original_price || null,
          }],
          numeroSend: cleanPhone,
          nomclient: name,
          return_url: return_url,
          webhook_url: webhookUrl,
        }),
      });

      const data = await res.json();
      console.log("MoneyFusion payin response:", JSON.stringify(data));

      if (!data.statut) {
        console.error("MoneyFusion payin error:", JSON.stringify(data));
        return new Response(
          JSON.stringify({ error: data.message || "Erreur MoneyFusion lors de l'initialisation du paiement" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const paymentToken = data.token;
      const paymentUrl = data.url;

      if (!paymentToken || !paymentUrl) {
        return new Response(
          JSON.stringify({ error: "Réponse MoneyFusion incomplète" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Save payment event with token as transaction reference
      await admin.from("payment_events").insert({
        store_owner_id: metadata.store_owner_id,
        product_id: metadata.product_id,
        amount: Math.round(Number(amount)),
        status: "initiated",
        session_id: metadata.session_id || null,
        moneroo_transaction_id: paymentToken, // Reuse column for MoneyFusion token
      });

      return new Response(
        JSON.stringify({
          data: {
            id: paymentToken,
            checkout_url: paymentUrl,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      const { transaction_id } = body;

      if (!transaction_id) {
        return new Response(
          JSON.stringify({ error: "transaction_id requis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Call MoneyFusion verification endpoint
      const response = await fetch(
        `https://www.pay.moneyfusion.net/paiementNotif/${transaction_id}`,
        { method: "GET" }
      );

      const data = await response.json();
      console.log("MoneyFusion verify response:", JSON.stringify(data));

      if (!data.statut) {
        return new Response(
          JSON.stringify({ error: data.message || "Erreur de vérification" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Map MoneyFusion status to internal status
      const mfStatus = data.data?.statut;
      let mappedStatus = "pending";
      if (mfStatus === "paid") {
        mappedStatus = "success";
      } else if (mfStatus === "failure" || mfStatus === "no paid") {
        mappedStatus = "failed";
      }

      // Update payment_events status
      if (mappedStatus === "success" || mappedStatus === "failed") {
        await admin
          .from("payment_events")
          .update({ status: mappedStatus })
          .eq("moneroo_transaction_id", transaction_id);
      }

      return new Response(
        JSON.stringify({
          data: {
            status: mappedStatus,
            moneyfusion_status: mfStatus,
            transaction_id,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Action invalide" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
