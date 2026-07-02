import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map country dial codes to Moneroo country suffixes
const countryDialToSuffix: Record<string, string> = {
  "229": "bj", // Bénin
  "225": "ci", // Côte d'Ivoire
  "228": "tg", // Togo
  "223": "ml", // Mali
  "221": "sn", // Sénégal
  "226": "bf", // Burkina Faso
  "227": "ne", // Niger
  "237": "cm", // Cameroun
};

// Get Moneroo payout method based on operator and phone country
function getPayoutMethod(operator: string, phone: string): string {
  // Detect country from phone number prefix
  let countrySuffix = "bj"; // default to Bénin
  for (const [dial, suffix] of Object.entries(countryDialToSuffix)) {
    if (phone.startsWith(dial)) {
      countrySuffix = suffix;
      break;
    }
  }
  const op = operator || "mtn";
  return `${op}_${countrySuffix}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const monerooKey = Deno.env.get("MONEROO_SECRET_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

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

    // Get user profile for required first_name / last_name
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

    // Attempt payout via Moneroo
    if (monerooKey) {
      try {
        // Clean phone: remove spaces and leading +
        const cleanPhone = phoneNumber.replace(/\s+/g, "").replace(/^\+/, "");
        const method = getPayoutMethod(operator, cleanPhone);

        const payoutRes = await fetch("https://api.moneroo.io/v1/payouts/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${monerooKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(amount),
            currency: "XOF",
            description: `Retrait gains - ${withdrawal.id}`,
            method,
            customer: {
              email: user.email,
              first_name: firstName,
              last_name: lastName,
              phone: cleanPhone,
            },
            recipient: {
              msisdn: cleanPhone,
            },
            metadata: {
              withdrawal_id: withdrawal.id,
              user_id: user.id,
            },
          }),
        });

        const payoutData = await payoutRes.json();

        if (payoutRes.ok && payoutData?.data?.id) {
          await supabase
            .from("withdrawals")
            .update({
              moneroo_reference: payoutData.data.id,
              status: "processing",
            })
            .eq("id", withdrawal.id);
        } else {
          console.error("Moneroo payout error:", payoutData);
          await supabase
            .from("withdrawals")
            .update({
              status: "failed",
            })
            .eq("id", withdrawal.id);
          throw new Error(payoutData?.message || "Erreur Moneroo lors du payout");
        }
      } catch (payoutErr: any) {
        if (
          payoutErr.message?.includes("Moneroo") ||
          payoutErr.message?.includes("Erreur") ||
          payoutErr.message?.includes("minimum")
        )
          throw payoutErr;
        console.error("Payout request failed:", payoutErr);
        await supabase.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
        throw new Error(
          "Erreur de connexion au service de paiement: " + (payoutErr.message || "erreur inconnue"),
        );
      }
    } else {
      await supabase.from("withdrawals").update({ status: "pending" }).eq("id", withdrawal.id);
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
