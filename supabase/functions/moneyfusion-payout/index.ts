import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MONEYFUSION_API_URL = "https://pay.moneyfusion.net/api/v1/withdraw";

// Map operator + country to MoneyFusion withdraw_mode
function getWithdrawMode(operator: string, countryCode: string): string {
  const op = (operator || "mtn").toLowerCase();
  const cc = (countryCode || "bj").toLowerCase();

  const modeMap: Record<string, Record<string, string>> = {
    bj: { mtn: "mtn-benin", moov: "moov-benin" },
    ci: { mtn: "mtn-ci", orange: "orange-money-ci", moov: "moov-ci", wave: "wave-ci" },
    sn: { orange: "orange-money-senegal", wave: "wave-senegal", free: "free-money-senegal" },
    bf: { orange: "orange-money-burkina", moov: "moov-burkina-faso" },
    tg: { moov: "moov-togo", tmoney: "t-money-togo" },
    ml: { orange: "orange-money-mali" },
    cm: { orange: "orange-money-cm", mtn: "mtn-cm" },
    gn: { orange: "orange-gn", mtn: "mtn-gn" },
    gh: { mtn: "mtn-gh", airtel: "airtel-money-gh", vodafone: "vodafone-gh" },
    cd: { airtel: "airtel-money-cd" },
    ga: { airtel: "airtel-money-ga" },
    ke: { mpesa: "m-pesa-ke" },
    cg: { mtn: "mtn-cg", orange: "orange-money-mali" },
  };

  return modeMap[cc]?.[op] || `${op}-${cc}`;
}

function extractCountryCode(phoneNumber: string): { countryCode: string; localPhone: string } {
  const cleanPhone = phoneNumber.replace(/\s+/g, "").replace(/^\+/, "");

  const dialToCountry: Record<string, string> = {
    "229": "bj",
    "225": "ci",
    "228": "tg",
    "223": "ml",
    "221": "sn",
    "226": "bf",
    "224": "gn",
    "237": "cm",
    "233": "gh",
    "243": "cd",
    "241": "ga",
    "254": "ke",
    "242": "cg",
  };

  for (const [dial, cc] of Object.entries(dialToCountry)) {
    if (cleanPhone.startsWith(dial)) {
      return { countryCode: cc, localPhone: cleanPhone.substring(dial.length) };
    }
  }

  return { countryCode: "bj", localPhone: cleanPhone };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const moneyfusionKey = Deno.env.get("MONEYFUSION_PRIVATE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (!moneyfusionKey) {
      throw new Error("MoneyFusion private key not configured");
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

    // Extract country and local phone
    const { countryCode, localPhone } = extractCountryCode(phoneNumber);
    const withdrawMode = getWithdrawMode(operator, countryCode);

    // Build webhook URL
    const webhookUrl = `${supabaseUrl}/functions/v1/moneyfusion-payout-webhook`;

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
      // Call MoneyFusion Payout API
      const res = await fetch(MONEYFUSION_API_URL, {
        method: "POST",
        headers: {
          "moneyfusion-private-key": moneyfusionKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryCode,
          phone: localPhone,
          amount: Math.round(amount),
          withdraw_mode: withdrawMode,
          webhook_url: webhookUrl,
        }),
      });

      const data = await res.json();
      console.log("MoneyFusion payout response:", JSON.stringify(data));

      if (!data.statut) {
        console.error("MoneyFusion payout error:", JSON.stringify(data));
        await supabase.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
        throw new Error(data.message || "Erreur MoneyFusion lors du retrait");
      }

      // Save tokenPay as reference
      await supabase
        .from("withdrawals")
        .update({
          moneroo_reference: data.tokenPay,
          status: "processing",
        })
        .eq("id", withdrawal.id);
    } catch (payoutErr: any) {
      if (
        payoutErr.message?.includes("MoneyFusion") ||
        payoutErr.message?.includes("Solde") ||
        payoutErr.message?.includes("minimum")
      ) {
        throw payoutErr;
      }
      console.error("Payout request failed:", payoutErr);
      await supabase.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
      throw new Error(
        "Erreur de connexion au service de retrait: " + (payoutErr.message || "erreur inconnue"),
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
