import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FEDAPAY_API_URL = "https://api.fedapay.com/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...body } = await req.json();
    const FEDAPAY_SECRET_KEY = Deno.env.get("FEDAPAY_SECRET_KEY");

    if (!FEDAPAY_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "FedaPay secret key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (action === "initialize") {
      const { amount, currency, customer, metadata, return_url } = body;

      const email = customer?.email?.trim()?.toLowerCase();
      const name = customer?.name?.trim();
      const phone = customer?.phone?.trim();

      if (
        !amount ||
        !email ||
        !name ||
        !phone ||
        !metadata?.product_id ||
        !metadata?.store_owner_id ||
        !return_url
      ) {
        return new Response(JSON.stringify({ error: "Paramètres de paiement incomplets" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create or update customer server-side
      let customerId: string;
      const { data: existingCustomer, error: existingError } = await admin
        .from("customers")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingError) {
        return new Response(JSON.stringify({ error: `Erreur client: ${existingError.message}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        customerId = newCustomer.id;
      }

      // Detect country from phone number
      const cleanPhone = phone.replace(/\s+/g, "").replace(/^\+/, "");
      let phoneCountry = "bj";
      const dialToCountry: Record<string, string> = {
        "229": "bj",
        "225": "ci",
        "228": "tg",
        "223": "ml",
        "221": "sn",
        "226": "bf",
        "227": "ne",
        "224": "gn",
      };
      for (const [dial, country] of Object.entries(dialToCountry)) {
        if (cleanPhone.startsWith(dial)) {
          phoneCountry = country;
          break;
        }
      }

      // Generate unique merchant reference
      const merchantRef = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Step 1: Create FedaPay transaction
      const nameParts = name.split(" ");
      const firstName = nameParts[0] || "Client";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const createRes = await fetch(`${FEDAPAY_API_URL}/transactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FEDAPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: metadata?.product_title || "Achat produit",
          amount: Math.round(Number(amount)),
          currency: { iso: currency || "XOF" },
          callback_url: return_url,
          customer: {
            firstname: firstName,
            lastname: lastName,
            email,
            phone_number: {
              number: cleanPhone.startsWith("229") ? cleanPhone.substring(3) : cleanPhone,
              country: phoneCountry,
            },
          },
          merchant_reference: merchantRef,
          custom_metadata: {
            product_id: metadata.product_id,
            customer_id: customerId,
            store_owner_id: metadata.store_owner_id,
          },
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        console.error("FedaPay create error:", JSON.stringify(createData));
        return new Response(
          JSON.stringify({ error: createData?.message || "Erreur FedaPay lors de la création" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // FedaPay returns data under "v1/transaction" key (with slash)
      const txn =
        createData?.["v1/transaction"] || createData?.v1?.transaction || createData?.transaction;
      const transactionId = txn?.id;
      const paymentUrl = txn?.payment_url;

      if (!transactionId) {
        console.error("FedaPay response structure:", JSON.stringify(createData));
        return new Response(
          JSON.stringify({ error: "Impossible de récupérer l'ID de transaction FedaPay" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Step 2: Generate payment token/link
      let checkoutUrl = paymentUrl; // Already available from create response

      if (!checkoutUrl) {
        const tokenRes = await fetch(`${FEDAPAY_API_URL}/transactions/${transactionId}/token`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FEDAPAY_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
          console.error("FedaPay token error:", JSON.stringify(tokenData));
          return new Response(
            JSON.stringify({
              error: tokenData?.message || "Erreur FedaPay lors de la génération du lien",
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        checkoutUrl = tokenData?.url || tokenData?.token;
      }

      // Save payment event
      await admin.from("payment_events").insert({
        store_owner_id: metadata.store_owner_id,
        product_id: metadata.product_id,
        amount: Math.round(Number(amount)),
        status: "initiated",
        session_id: metadata.session_id || null,
        moneroo_transaction_id: String(transactionId), // Reuse column for FedaPay transaction ID
      });

      return new Response(
        JSON.stringify({
          data: {
            id: transactionId,
            checkout_url: checkoutUrl,
            merchant_reference: merchantRef,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "verify") {
      const { transaction_id } = body;

      if (!transaction_id) {
        return new Response(JSON.stringify({ error: "transaction_id requis" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch(`${FEDAPAY_API_URL}/transactions/${transaction_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FEDAPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return new Response(JSON.stringify({ error: data?.message || "Erreur de vérification" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Map FedaPay status to our internal status
      const verifyTxn = data?.["v1/transaction"] || data?.v1?.transaction || data?.transaction;
      const fedaStatus = verifyTxn?.status;
      let mappedStatus = "pending";
      if (fedaStatus === "approved" || fedaStatus === "transferred") {
        mappedStatus = "success";
      } else if (
        fedaStatus === "declined" ||
        fedaStatus === "canceled" ||
        fedaStatus === "expired"
      ) {
        mappedStatus = "failed";
      }

      // Update payment_events status
      if (mappedStatus === "success" || mappedStatus === "failed") {
        await admin
          .from("payment_events")
          .update({ status: mappedStatus })
          .eq("moneroo_transaction_id", String(transaction_id));
      }

      return new Response(
        JSON.stringify({
          data: {
            status: mappedStatus,
            fedapay_status: fedaStatus,
            transaction_id,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
