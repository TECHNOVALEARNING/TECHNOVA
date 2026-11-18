import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Fermeture d'un compte vendeur par le vendeur lui-même.
//
// On ne supprime PAS l'utilisateur : products.creator_id et orders.product_id sont en
// ON DELETE CASCADE, donc effacer le compte effacerait aussi les commandes des clients
// (et leur accès aux produits achetés). La fermeture :
//   - dépublie et masque tous les produits du vendeur,
//   - archive ses boutiques,
//   - retire l'accès vendeur (app_metadata, modifiable uniquement côté serveur).
// Les commandes, factures et accès des acheteurs restent intacts. L'administrateur peut
// réactiver le compte avec « Ajouter un vendeur ».

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = ["ancres707@gmail.com"];
const CONFIRM_WORD = "SUPPRIMER";
const MIN_WITHDRAWAL = 100;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Non authentifié" }, 401);
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(token);
    if (authError || !user) return json({ error: "Non authentifié" }, 401);

    const email = String(user.email || "").toLowerCase();
    if (ADMIN_EMAILS.includes(email)) {
      return json({ error: "Le compte administrateur ne peut pas être fermé." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    if (
      String(body?.confirm || "")
        .trim()
        .toUpperCase() !== CONFIRM_WORD
    ) {
      return json({ error: `Tapez ${CONFIRM_WORD} pour confirmer.` }, 400);
    }

    // Retraits en cours : on attend qu'ils soient terminés
    const { data: pending } = await admin
      .from("withdrawals")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing"])
      .limit(1);
    if (pending && pending.length > 0) {
      return json(
        {
          error:
            "Un retrait est encore en cours. Attendez qu'il soit terminé avant de fermer votre compte.",
          code: "pending_withdrawal",
        },
        409,
      );
    }

    // Solde disponible (même calcul que request-payout) : à retirer avant la fermeture
    const { data: orders } = await admin
      .from("orders")
      .select("amount")
      .eq("store_owner_id", user.id)
      .eq("status", "completed");
    const totalSales = (orders || []).reduce((s: number, o: any) => s + Number(o.amount || 0), 0);
    const { data: feeRow } = await admin
      .from("platform_fees")
      .select("value_pct")
      .eq("key", "technova_commission_pct")
      .maybeSingle();
    const commissionPct = Number(feeRow?.value_pct ?? 5) / 100;
    const { data: withdrawals } = await admin
      .from("withdrawals")
      .select("amount")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "completed"]);
    const totalWithdrawn = (withdrawals || []).reduce(
      (s: number, w: any) => s + Number(w.amount || 0),
      0,
    );
    const available = Math.floor(totalSales * (1 - commissionPct) - totalWithdrawn);
    if (available >= MIN_WITHDRAWAL) {
      return json(
        {
          error: `Il vous reste ${available} FCFA à retirer. Faites un retrait avant de fermer votre compte.`,
          code: "balance_remaining",
          available,
        },
        409,
      );
    }

    const closedAt = new Date().toISOString();

    const { error: productsErr } = await admin
      .from("products")
      .update({ is_published: false, hide_from_store: true })
      .eq("creator_id", user.id);
    if (productsErr) throw productsErr;

    const { error: storesErr } = await admin
      .from("stores")
      .update({ is_archived: true })
      .eq("owner_id", user.id);
    if (storesErr) throw storesErr;

    const { error: profileErr } = await admin
      .from("profiles")
      .update({ onboarding_completed: false })
      .eq("id", user.id);
    if (profileErr) throw profileErr;

    const { error: metaErr } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...(user.app_metadata || {}), seller: false, seller_closed_at: closedAt },
    });
    if (metaErr) throw metaErr;

    console.log(`[close-seller-account] compte vendeur fermé: ${user.id}`);
    return json({ success: true, closed_at: closedAt });
  } catch (err) {
    console.error("[close-seller-account]", err);
    return json(
      { error: "La fermeture du compte a échoué. Réessayez ou contactez l'administrateur." },
      500,
    );
  }
});
