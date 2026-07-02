// Receive Moneroo payout webhooks and update withdrawal status
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-moneroo-signature",
};

async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const raw = await req.text();
    const signature = req.headers.get("x-moneroo-signature") || "";
    const webhookSecret = Deno.env.get("MONEROO_WEBHOOK_SECRET");
    if (webhookSecret) {
      const ok = await verifySignature(webhookSecret, raw, signature);
      if (!ok) console.warn("[moneroo-payout-webhook] signature invalide");
    }

    const event = JSON.parse(raw || "{}");
    console.log("[moneroo-payout-webhook] event", JSON.stringify(event).slice(0, 500));
    const data = event?.data || event;
    const monerooId = data?.id;
    const status = (data?.status || event?.event || "").toString().toLowerCase();
    const withdrawalId = data?.metadata?.withdrawal_id;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let withdrawal: any = null;
    if (withdrawalId) {
      const { data: w } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("id", withdrawalId)
        .maybeSingle();
      withdrawal = w;
    }
    if (!withdrawal && monerooId) {
      const { data: w } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("moneroo_payout_id", monerooId)
        .maybeSingle();
      withdrawal = w;
    }
    if (!withdrawal) {
      console.warn("[moneroo-payout-webhook] withdrawal introuvable", { monerooId, withdrawalId });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSuccess = [
      "success",
      "successful",
      "completed",
      "paid",
      "payout.success",
      "payout.completed",
    ].includes(status);
    const isFailed = ["failed", "cancelled", "canceled", "rejected", "payout.failed"].includes(
      status,
    );

    if (isSuccess && withdrawal.status !== "completed") {
      await supabase
        .from("withdrawals")
        .update({ status: "completed", processed_at: new Date().toISOString() })
        .eq("id", withdrawal.id);
      await supabase.from("notifications").insert({
        user_id: withdrawal.user_id,
        title: "Retrait effectué ✅",
        message: `Votre retrait de ${withdrawal.amount} FCFA a été envoyé avec succès.`,
        type: "success",
      });
    } else if (isFailed) {
      await supabase.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
      await supabase.from("notifications").insert({
        user_id: withdrawal.user_id,
        title: "Retrait échoué ❌",
        message: `Votre retrait de ${withdrawal.amount} FCFA a échoué. Veuillez réessayer.`,
        type: "error",
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[moneroo-payout-webhook] error", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
