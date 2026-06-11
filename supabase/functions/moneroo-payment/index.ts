import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...body } = await req.json();
    const MONEROO_SECRET_KEY = Deno.env.get("MONEROO_SECRET_KEY");

    if (!MONEROO_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Moneroo secret key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "initialize") {
      const { amount, currency, customer, metadata, return_url } = body;

      const email = customer?.email?.trim()?.toLowerCase();
      const name = customer?.name?.trim();
      const phone = customer?.phone?.trim();

      if (!amount || !email || !name || !phone || !metadata?.product_id || !metadata?.store_owner_id || !return_url) {
        return new Response(
          JSON.stringify({ error: "Paramètres de paiement incomplets" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create or update customer server-side (bypasses client RLS issues)
      let customerId: string;
      const { data: existingCustomer, error: existingError } = await admin
        .from("customers")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingError) {
        return new Response(
          JSON.stringify({ error: `Erreur client: ${existingError.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (existingCustomer?.id) {
        customerId = existingCustomer.id;
        await admin
          .from("customers")
          .update({ name, phone })
          .eq("id", customerId);
      } else {
        const { data: newCustomer, error: createError } = await admin
          .from("customers")
          .insert({ email, name, phone })
          .select("id")
          .single();

        if (createError) {
          return new Response(
            JSON.stringify({ error: `Erreur création client: ${createError.message}` }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        customerId = newCustomer.id;
      }

      const response = await fetch("https://api.moneroo.io/v1/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MONEROO_SECRET_KEY}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(Number(amount)),
          currency: currency || "XOF",
          description: metadata?.product_title || "Achat produit",
          customer: {
            email,
            first_name: name.split(" ")[0],
            last_name: name.split(" ").slice(1).join(" ") || name.split(" ")[0],
            phone,
          },
          return_url,
          metadata: {
            product_id: metadata.product_id,
            customer_id: customerId,
            store_owner_id: metadata.store_owner_id,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Moneroo init error:", JSON.stringify(data));
        return new Response(
          JSON.stringify({ error: data.message || "Erreur Moneroo" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Save payment event with Moneroo transaction ID for realtime tracking
      const monerooTransactionId = data?.data?.id;
      if (monerooTransactionId) {
        await admin.from("payment_events").insert({
          store_owner_id: metadata.store_owner_id,
          product_id: metadata.product_id,
          amount: Math.round(Number(amount)),
          status: "initiated",
          session_id: metadata.session_id || null,
          moneroo_transaction_id: monerooTransactionId,
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const { transaction_id } = body;

      if (!transaction_id) {
        return new Response(
          JSON.stringify({ error: "transaction_id requis" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const response = await fetch(
        `https://api.moneroo.io/v1/payments/${transaction_id}/verify`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${MONEROO_SECRET_KEY}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: data.message || "Erreur de vérification" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Update payment_events status for realtime UI update
      if (data.data?.status === "success" || data.data?.status === "failed") {
        const paymentStatus = data.data.status;
        await admin
          .from("payment_events")
          .update({ status: paymentStatus })
          .eq("moneroo_transaction_id", transaction_id);
      }
      // Note: Order creation is handled exclusively by the webhook to avoid duplicates

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Action invalide" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
