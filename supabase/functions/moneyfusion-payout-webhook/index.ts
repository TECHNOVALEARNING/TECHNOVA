import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    console.log("MoneyFusion payout webhook received:", JSON.stringify(body));

    const { event, tokenPay, montant, numeroRetrait, moyen } = body;

    if (!tokenPay) {
      console.error("No tokenPay in webhook payload");
      return new Response(JSON.stringify({ error: "Missing tokenPay" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find withdrawal by tokenPay (stored in moneroo_reference)
    const { data: withdrawal, error: findError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("moneroo_reference", tokenPay)
      .single();

    if (findError || !withdrawal) {
      console.error("Withdrawal not found for tokenPay:", tokenPay);
      return new Response(JSON.stringify({ error: "Withdrawal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event === "payout.session.completed") {
      // Payout successful
      await supabase.from("withdrawals").update({
        status: "completed",
        processed_at: new Date().toISOString(),
      }).eq("id", withdrawal.id);

      // Notify user
      await supabase.from("notifications").insert({
        user_id: withdrawal.user_id,
        title: "Retrait effectué ✅",
        message: `Votre retrait de ${montant || withdrawal.amount} FCFA a été envoyé avec succès.`,
        type: "success",
      });

      console.log("Withdrawal completed:", withdrawal.id);

    } else if (event === "payout.session.cancelled") {
      // Payout failed/cancelled
      await supabase.from("withdrawals").update({
        status: "failed",
      }).eq("id", withdrawal.id);

      // Notify user
      await supabase.from("notifications").insert({
        user_id: withdrawal.user_id,
        title: "Retrait échoué ❌",
        message: `Votre retrait de ${montant || withdrawal.amount} FCFA a échoué. Veuillez réessayer.`,
        type: "error",
      });

      console.log("Withdrawal failed:", withdrawal.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
