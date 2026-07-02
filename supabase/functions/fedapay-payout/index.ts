import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FEDAPAY_API_URL = "https://api.fedapay.com/v1";

// Map operator + country to FedaPay payout mode
// Available: mtn_open (Bénin), moov_bj, celtiis_bj, moov_tg, togocom_tg, mtn_gn, mtn_ci, moov_ci, wave_ci, orange_ci, wave_sn, orange_sn, moov_bf, orange_bf
function getPayoutMode(operator: string, phone: string): string {
  const cleanPhone = phone.replace(/\s+/g, "").replace(/^\+/, "");

  let country = "bj";
  const dialToCountry: Record<string, string> = {
    "229": "bj",
    "225": "ci",
    "228": "tg",
    "223": "ml",
    "221": "sn",
    "226": "bf",
    "224": "gn",
  };
  for (const [dial, c] of Object.entries(dialToCountry)) {
    if (cleanPhone.startsWith(dial)) {
      country = c;
      break;
    }
  }

  const op = (operator || "mtn").toLowerCase();

  // Special case: MTN Bénin uses mtn_open
  if (op === "mtn" && country === "bj") return "mtn_open";

  return `${op}_${country}`;
}

function extractPhoneInfo(phoneNumber: string): { localPhone: string; country: string } {
  const cleanPhone = phoneNumber.replace(/\s+/g, "").replace(/^\+/, "");

  const dialToCountry: Record<string, string> = {
    "229": "BJ",
    "225": "CI",
    "228": "TG",
    "223": "ML",
    "221": "SN",
    "226": "BF",
    "224": "GN",
  };

  let country = "BJ";
  let localPhone = cleanPhone;

  for (const [dial, c] of Object.entries(dialToCountry)) {
    if (cleanPhone.startsWith(dial)) {
      country = c;
      localPhone = cleanPhone.substring(dial.length);
      break;
    }
  }

  return { localPhone, country };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fedapayKey = Deno.env.get("FEDAPAY_SECRET_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (!fedapayKey) {
      throw new Error("FedaPay secret key not configured");
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Non authentifié");

    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser(token);
    if (authError || !user) throw new Error("Non authentifié");

    const { amount, phoneNumber, operator } = await req.json();

    if (!amount || amount <= 0) throw new Error("Montant invalide");
    if (amount < 100) throw new Error("Le montant minimum de retrait est de 100 FCFA");
    if (!phoneNumber) throw new Error("Numéro de téléphone requis");

    // Calculate available balance
    const { data: orders } = await supabase
      .from("orders")
      .select("amount")
      .eq("store_owner_id", user.id)
      .eq("status", "completed");

    const totalSales = (orders || []).reduce((sum: number, o: any) => sum + Number(o.amount), 0);
    const { data: feeRow } = await supabase
      .from("platform_fees")
      .select("value_pct")
      .eq("key", "technova_commission_pct")
      .maybeSingle();
    const commissionPct = Number(feeRow?.value_pct ?? 5) / 100;
    const commission = totalSales * commissionPct;
    const grossAvailable = totalSales - commission;

    const { data: withdrawals } = await supabase
      .from("withdrawals")
      .select("amount")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "completed"]);

    const totalWithdrawn = (withdrawals || []).reduce(
      (sum: number, w: any) => sum + Number(w.amount),
      0,
    );
    const availableBalance = grossAvailable - totalWithdrawn;

    if (amount > availableBalance) {
      throw new Error(`Solde insuffisant. Disponible: ${Math.floor(availableBalance)} FCFA`);
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const displayName = profile?.display_name || user.email?.split("@")[0] || "Utilisateur";
    const nameParts = displayName.split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "User";

    // Create withdrawal record
    const { data: withdrawal, error: insertError } = await supabase
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount,
        fee: 0,
        net_amount: amount,
        phone_number: phoneNumber,
        operator: operator || "mtn",
        status: "processing",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    try {
      const cleanPhone = phoneNumber.replace(/\s+/g, "").replace(/^\+/, "");
      const mode = getPayoutMode(operator, cleanPhone);
      const { country } = extractPhoneInfo(phoneNumber);
      const fullPhone = `+${cleanPhone}`;

      // Step 1: Create payout via FedaPay API (docs: https://docs-v1.fedapay.com/paiements/transferts)
      const createRes = await fetch(`${FEDAPAY_API_URL}/payouts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${fedapayKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          currency: { iso: "XOF" },
          mode,
          description: `Retrait gains - ${withdrawal.id}`,
          customer: {
            firstname: firstName,
            lastname: lastName,
            email: user.email,
            phone_number: {
              number: fullPhone,
              country: country.toLowerCase(),
            },
          },
        }),
      });

      const createData = await createRes.json();
      console.log("FedaPay payout create response:", JSON.stringify(createData));

      if (!createRes.ok) {
        console.error("FedaPay payout create error:", JSON.stringify(createData));
        await supabase.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
        throw new Error(createData?.message || "Erreur FedaPay lors du retrait");
      }

      // FedaPay returns data under "v1/payout" key
      const payoutObj = createData?.["v1/payout"] || createData?.v1?.payout || createData?.payout;
      const payoutId = payoutObj?.id;

      if (!payoutId) {
        console.error("FedaPay payout response - no ID found:", JSON.stringify(createData));
        await supabase.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
        throw new Error("Impossible de récupérer l'ID du payout FedaPay");
      }

      // Step 2: Start the payout (docs: PUT /v1/payouts/start with { payouts: [...] })
      const startRes = await fetch(`${FEDAPAY_API_URL}/payouts/start`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${fedapayKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payouts: [{ id: payoutId }],
        }),
      });

      const startData = await startRes.json();
      console.log("FedaPay payout start response:", JSON.stringify(startData));

      if (!startRes.ok) {
        console.error("FedaPay payout start error:", JSON.stringify(startData));
        await supabase.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
        throw new Error(startData?.message || "Erreur FedaPay lors du démarrage du retrait");
      }

      // Save FedaPay payout ID as reference
      await supabase
        .from("withdrawals")
        .update({
          moneroo_reference: String(payoutId),
          status: "processing",
        })
        .eq("id", withdrawal.id);
    } catch (payoutErr: any) {
      if (
        payoutErr.message?.includes("FedaPay") ||
        payoutErr.message?.includes("Erreur") ||
        payoutErr.message?.includes("minimum") ||
        payoutErr.message?.includes("Solde") ||
        payoutErr.message?.includes("Impossible")
      ) {
        throw payoutErr;
      }
      console.error("Payout request failed:", payoutErr);
      await supabase.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
      throw new Error(
        "Erreur de connexion au service de paiement: " + (payoutErr.message || "erreur inconnue"),
      );
    }

    // Notify user
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Demande de retrait",
      message: `Votre demande de retrait de ${amount} FCFA vers ${phoneNumber} est en cours de traitement.`,
      type: "info",
    });

    return new Response(JSON.stringify({ success: true, withdrawal_id: withdrawal.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
