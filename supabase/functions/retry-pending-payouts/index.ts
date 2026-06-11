// Scheduled job: verifies Moneroo payouts stuck in "processing" by polling
// Moneroo's API, and marks them completed/failed accordingly.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MONEROO_BASE = "https://api.moneroo.io/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = Deno.env.get("MONEROO_SECRET_KEY");
    if (!token) return j({ error: "Moneroo non configuré" }, 500);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify Moneroo payouts older than 1 minute that are still "processing"
    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const { data: processings, error } = await admin
      .from("withdrawals")
      .select("id, user_id, amount, phone_number, moneroo_payout_id")
      .eq("status", "processing")
      .not("moneroo_payout_id", "is", null)
      .lte("created_at", cutoff)
      .limit(50);

    if (error) return j({ error: error.message }, 500);

    let verified = 0, completed = 0, failed = 0;

    for (const w of processings || []) {
      verified++;
      try {
        const resp = await fetch(`${MONEROO_BASE}/payouts/${w.moneroo_payout_id}/verify`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await resp.json();
        const tx = data?.data || data;
        const status = String(tx?.status || "").toLowerCase();
        console.log(`[retry-pending-payouts] verify ${w.id} → ${resp.status} ${status}`);

        const isSuccess = ["success", "successful", "completed", "paid"].includes(status);
        const isFailed = ["failed", "cancelled", "canceled", "rejected"].includes(status);

        if (isSuccess) {
          await admin.from("withdrawals").update({
            status: "completed", processed_at: new Date().toISOString(),
          }).eq("id", w.id);
          await admin.from("notifications").insert({
            user_id: w.user_id,
            title: "Retrait effectué ✅",
            message: `Votre retrait de ${w.amount} FCFA vers ${w.phone_number} a été envoyé avec succès.`,
            type: "success",
          });
          completed++;
        } else if (isFailed) {
          await admin.from("withdrawals").update({
            status: "failed", processed_at: new Date().toISOString(),
          }).eq("id", w.id);
          await admin.from("notifications").insert({
            user_id: w.user_id,
            title: "Retrait échoué ❌",
            message: `Votre retrait de ${w.amount} FCFA a échoué. Les fonds restent disponibles dans votre solde.`,
            type: "error",
          });
          failed++;
        }
      } catch (e: any) {
        console.error("[retry-pending-payouts] verify error", w.id, e.message);
      }
    }

    return j({ provider: "moneroo", verified, completed, failed });
  } catch (e: any) {
    console.error("[retry-pending-payouts] fatal", e);
    return j({ error: e.message }, 500);
  }

  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
