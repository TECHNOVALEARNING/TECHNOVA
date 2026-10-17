// Helpers partagés : authentification des appels internes et calcul du prix attendu.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Vrai si la requête vient du serveur : JWT service_role en Bearer,
 * ou en-tête x-internal-secret égal à INTERNAL_FUNCTIONS_SECRET (ex. cron, Vercel).
 */
export function isInternalCall(req: Request): boolean {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const bearer = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (serviceKey && safeEqual(bearer, serviceKey)) return true;

  const sharedSecret = Deno.env.get("INTERNAL_FUNCTIONS_SECRET") || "";
  const provided = req.headers.get("x-internal-secret") || "";
  return Boolean(sharedSecret) && safeEqual(provided, sharedSecret);
}

/** En-têtes à utiliser pour appeler une autre Edge Function protégée. */
export function internalHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
  };
  const sharedSecret = Deno.env.get("INTERNAL_FUNCTIONS_SECRET");
  if (sharedSecret) headers["x-internal-secret"] = sharedSecret;
  return headers;
}

export function parsePrice(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const s = String(val).replace(/\s/g, "").replace(/[^\d.,]/g, "").replace(/,/g, ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/**
 * Montant attendu pour un produit, avec code promo éventuel revalidé en base.
 * Un code invalide (inactif, expiré, épuisé, hors périmètre) est ignoré → prix plein.
 */
export async function computeExpectedAmount(
  supabase: SupabaseClient,
  product: { id: string; price: unknown; creator_id: string },
  promoCode?: string | null,
): Promise<{ expected: number; original: number; promoCode: string | null }> {
  const original = Math.round(parsePrice(product.price));
  if (!promoCode || original <= 0) return { expected: original, original, promoCode: null };

  const { data: promo } = await supabase
    .from("promo_codes")
    .select("code, discount_percent, discount_amount, expires_at, max_uses, current_uses, product_ids")
    .eq("code", String(promoCode).trim().toUpperCase())
    .eq("creator_id", product.creator_id)
    .eq("is_active", true)
    .maybeSingle();

  const valid =
    promo &&
    (!promo.expires_at || new Date(promo.expires_at) >= new Date()) &&
    (!promo.max_uses || (promo.current_uses || 0) < promo.max_uses) &&
    (!promo.product_ids || promo.product_ids.length === 0 || promo.product_ids.includes(product.id));

  if (!valid) return { expected: original, original, promoCode: null };

  let expected = original;
  if (promo.discount_percent) {
    expected = Math.max(0, Math.round(original * (1 - Number(promo.discount_percent) / 100)));
  } else if (promo.discount_amount) {
    expected = Math.max(0, original - Number(promo.discount_amount));
  }
  return { expected, original, promoCode: promo.code };
}
