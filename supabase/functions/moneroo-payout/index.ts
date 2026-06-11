// Initiate a Moneroo payout from a saved wallet (PIN-protected)
// Restreint aux 22 corridors PawaPay réellement opérationnels
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MONEROO_BASE = "https://api.moneroo.io/v1";

async function getKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"],
  );
}

// Whitelist STRICTE des 22 corridors opérationnels PawaPay (vérifiés via /v2/active-conf)
type Corridor = { method: string; currency: string; iso2: string };
const CORRIDORS: Record<string, Corridor> = {
  MTN_MOMO_BEN:      { method: "mtn_bj",    currency: "XOF", iso2: "BJ" },
  MOOV_BEN:          { method: "moov_bj",   currency: "XOF", iso2: "BJ" },
  MTN_MOMO_CIV:      { method: "mtn_ci",    currency: "XOF", iso2: "CI" },
  ORANGE_CIV:        { method: "orange_ci", currency: "XOF", iso2: "CI" },
  MTN_MOMO_CMR:      { method: "mtn_cm",    currency: "XAF", iso2: "CM" },
  AIRTEL_COD:        { method: "airtel_cd", currency: "CDF", iso2: "CD" },
  ORANGE_COD:        { method: "orange_cd", currency: "CDF", iso2: "CD" },
  VODACOM_MPESA_COD: { method: "mpesa_cd",  currency: "CDF", iso2: "CD" },
  MTN_MOMO_COG:      { method: "mtn_cg",    currency: "XAF", iso2: "CG" },
  AIRTEL_COG:        { method: "airtel_cg", currency: "XAF", iso2: "CG" },
  AIRTEL_GAB:        { method: "airtel_ga", currency: "XAF", iso2: "GA" },
  MPESA_KEN:         { method: "mpesa_ke",  currency: "KES", iso2: "KE" },
  MTN_MOMO_RWA:      { method: "mtn_rw",    currency: "RWF", iso2: "RW" },
  AIRTEL_RWA:        { method: "airtel_rw", currency: "RWF", iso2: "RW" },
  ORANGE_SEN:        { method: "orange_sn", currency: "XOF", iso2: "SN" },
  ORANGE_SLE:        { method: "orange_sl", currency: "SLE", iso2: "SL" },
  MTN_MOMO_UGA:      { method: "mtn_ug",    currency: "UGX", iso2: "UG" },
  AIRTEL_OAPI_UGA:   { method: "airtel_ug", currency: "UGX", iso2: "UG" },
  MTN_MOMO_ZMB:      { method: "mtn_zm",    currency: "ZMW", iso2: "ZM" },
  ZAMTEL_ZMB:        { method: "zamtel_zm", currency: "ZMW", iso2: "ZM" },
};
function resolveCorridor(code: string): Corridor | null {
  return CORRIDORS[(code || "").toUpperCase()] || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    const token = Deno.env.get("MONEROO_SECRET_KEY");
    if (!token) return j({ error: "Moneroo non configuré" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Non authentifié" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Non authentifié" }, 401);

    const { wallet_id, amount, unlock_token } = await req.json();
    if (!wallet_id) return j({ error: "Wallet requis" }, 400);
    if (!unlock_token) return j({ error: "PIN requis" }, 401);
    if (!amount || amount < 100) return j({ error: "Montant minimum 100" }, 400);

    // Verify unlock token
    try {
      const key = await getKey();
      const payload = await verify(unlock_token, key);
      if (payload.sub !== user.id || payload.aud !== "wallet") return j({ error: "Token invalide" }, 401);
    } catch {
      return j({ error: "PIN expiré, ressaisissez votre PIN" }, 401);
    }

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: wallet } = await admin.from("wallets").select("*").eq("id", wallet_id).eq("user_id", user.id).maybeSingle();
    if (!wallet) return j({ error: "Wallet introuvable" }, 404);

    // Corridor whitelist (sécurité: refuse tout opérateur non opérationnel)
    const corridor = resolveCorridor(wallet.provider_code);
    if (!corridor) {
      return j({ error: `Opérateur ${wallet.provider_code} non opérationnel pour les retraits` }, 400);
    }

    // KYC check (admin bypasses)
    const ADMIN_EMAIL = "isidoreagonan@gmail.com";
    if (user.email !== ADMIN_EMAIL) {
      const { data: kyc } = await admin.from("identity_verifications").select("status").eq("user_id", user.id).maybeSingle();
      if (kyc?.status !== "approved") return j({ error: "KYC non approuvé" }, 403);
    }

    // Compute available NET balance
    const COMMISSION = 0.10;
    const cutoff = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { data: orders } = await admin.from("orders").select("amount, created_at").eq("store_owner_id", user.id).eq("status", "completed");
    const matured = (orders || []).filter((o: any) => o.created_at <= cutoff).reduce((s: number, o: any) => s + Number(o.amount), 0);
    const netAvailable = matured * (1 - COMMISSION);
    const { data: ws } = await admin.from("withdrawals").select("amount").eq("user_id", user.id).in("status", ["pending", "processing", "completed"]);
    const totalWithdrawn = (ws || []).reduce((s: number, w: any) => s + Number(w.amount), 0);
    const available = netAvailable - totalWithdrawn;
    if (amount > available) return j({ error: `Solde insuffisant. Disponible: ${Math.floor(available)} ${corridor.currency}` }, 400);

    const cleanPhone = String(wallet.phone).replace(/\D/g, "");

    // Create withdrawal record (processing)
    const { data: withdrawal, error: insErr } = await admin
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount, fee: 0, net_amount: amount,
        phone_number: `+${cleanPhone}`,
        operator: wallet.provider_code.toLowerCase().split("_")[0],
        provider_code: wallet.provider_code,
        status: "processing",
      })
      .select().single();
    if (insErr) return j({ error: insErr.message }, 400);

    const payload = {
      amount: Math.round(Number(amount)),
      currency: corridor.currency,
      description: `Dukaio retrait`,
      method: corridor.method,
      customer: {
        first_name: wallet.holder_first_name || "Client",
        last_name: wallet.holder_last_name || "Dukaio",
        email: user.email,
        phone: `+${cleanPhone}`,
        country: corridor.iso2,
      },
      recipient: {
        msisdn: cleanPhone,
        phone_number: `+${cleanPhone}`,
        country: corridor.iso2,
        first_name: wallet.holder_first_name || "Client",
        last_name: wallet.holder_last_name || "Dukaio",
        email: user.email,
        address: "N/A",
        city: "N/A",
      },
      metadata: { withdrawal_id: withdrawal.id, user_id: user.id, wallet_id: wallet.id },
    };

    const resp = await fetch(`${MONEROO_BASE}/payouts/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    console.log("[moneroo-payout]", resp.status, JSON.stringify(data).slice(0, 500));

    if (!resp.ok) {
      const reason = data?.message || data?.error || JSON.stringify(data?.errors || {}) || "Erreur Moneroo";
      await admin.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
      return j({ error: reason }, 400);
    }

    const monerooPayoutId = data?.data?.id;
    await admin.from("withdrawals").update({ moneroo_payout_id: monerooPayoutId }).eq("id", withdrawal.id);

    await admin.from("notifications").insert({
      user_id: user.id,
      title: "Retrait initié",
      message: `Retrait de ${amount} ${corridor.currency} vers ${wallet.name} en cours.`,
      type: "info",
    });

    return j({ success: true, withdrawal_id: withdrawal.id, status: "processing" });
  } catch (e: any) {
    console.error("[moneroo-payout] error", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
