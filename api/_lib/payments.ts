// Logique serveur partagée pour la validation des paiements (Nyole / Moneroo).
// Les fichiers préfixés par "_" dans api/ ne sont pas exposés comme routes par Vercel.
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a || "", "utf8");
  const bb = Buffer.from(b || "", "utf8");
  if (ba.length !== bb.length || ba.length === 0) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function parsePrice(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const s = String(val).replace(/\s/g, "").replace(/[^\d.,]/g, "").replace(/,/g, ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/** Lit le corps brut de la requête (nécessaire pour vérifier une signature HMAC). */
export async function readRawBody(req: any): Promise<string> {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  if (req.readable !== false && typeof req.on === "function") {
    const chunks: Buffer[] = [];
    const raw = await new Promise<string>((resolve) => {
      const timer = setTimeout(() => resolve(""), 3000);
      req.on("data", (c: Buffer) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on("end", () => {
        clearTimeout(timer);
        resolve(Buffer.concat(chunks).toString("utf8"));
      });
      req.on("error", () => {
        clearTimeout(timer);
        resolve("");
      });
    });
    if (raw) return raw;
  }
  return req.body ? JSON.stringify(req.body) : "";
}

/**
 * Montant attendu pour un produit, avec code promo éventuel validé côté serveur.
 * Un code invalide (inactif, expiré, épuisé, hors périmètre) est ignoré → prix plein.
 */
export async function computeExpectedAmount(
  supabase: SupabaseClient,
  product: { id: string; price: any; creator_id: string },
  promoCode?: string | null,
): Promise<{ expected: number; original: number; promoCode: string | null }> {
  const original = Math.round(parsePrice(product.price));
  if (!promoCode || original <= 0) return { expected: original, original, promoCode: null };

  const { data: promo } = await supabase
    .from("promo_codes")
    .select("code, discount_percent, discount_amount, expires_at, max_uses, current_uses, product_ids, is_active")
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

// ─── Vérification auprès des prestataires ───

export interface VerifiedPayment {
  paid: boolean;
  failed: boolean;
  status: string;
  amount: number | null;
  currency: string | null;
  metadata: Record<string, any>;
  customer: { name?: string; email?: string; phone?: string };
}

function nyoleConfig() {
  const apiKey = process.env.NYOLE_API_KEY || process.env.VITE_NYOLE_PUBLIC_KEY;
  const baseUrl = (process.env.NYOLE_BASE_URL || "https://app.nyole.com/api/v1").replace(/\/+$/, "");
  return { apiKey, baseUrl };
}

function toAmount(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : Math.round(n);
}

/** Interroge l'API Nyole : seule source faisant autorité sur le statut d'une session. */
export async function verifyNyoleSession(sessionId: string): Promise<VerifiedPayment | null> {
  const { apiKey, baseUrl } = nyoleConfig();
  if (!apiKey || !sessionId) return null;
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
  const id = encodeURIComponent(sessionId);

  const statusRes = await fetch(`${baseUrl}/checkout/sessions/${id}/status`, { headers });
  if (!statusRes.ok) {
    console.warn(`[payments] Nyole status HTTP ${statusRes.status} for ${sessionId}`);
    return null;
  }
  const s: any = await statusRes.json();
  let full: any = null;
  // Détails complets (montant / metadata) si le endpoint /status ne les renvoie pas
  if (s.amount === undefined || !s.metadata) {
    try {
      const r = await fetch(`${baseUrl}/checkout/sessions/${id}`, { headers });
      if (r.ok) full = await r.json();
    } catch {
      // non bloquant
    }
  }
  const src = { ...(full?.data || full || {}), ...s };
  const status = String(src.status || "").toUpperCase();
  return {
    paid: src.paid === true || status === "SUCCESS" || status === "COMPLETED",
    failed: ["FAILED", "CANCELLED", "EXPIRED", "REJECTED"].includes(status),
    status: status || "PENDING",
    amount: toAmount(src.amount ?? src.amount_total),
    currency: src.currency ? String(src.currency).toUpperCase() : null,
    metadata: src.metadata || {},
    customer: {
      name: src.customer_name || src.customer?.name,
      email: src.customer_email || src.customer?.email,
      phone: src.customer_phone || src.customer?.phone,
    },
  };
}

/** Interroge l'API Moneroo (GET /payments/:id/verify). */
export async function verifyMonerooPayment(paymentId: string): Promise<VerifiedPayment | null> {
  const key = process.env.MONEROO_SECRET_KEY;
  if (!key || !paymentId) return null;
  const r = await fetch(`https://api.moneroo.io/v1/payments/${encodeURIComponent(paymentId)}/verify`, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  if (!r.ok) {
    console.warn(`[payments] Moneroo verify HTTP ${r.status} for ${paymentId}`);
    return null;
  }
  const body: any = await r.json();
  const tx = body?.data || body;
  const status = String(tx?.status || "").toUpperCase();
  return {
    paid: ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(status),
    failed: ["FAILED", "CANCELLED", "CANCELED", "REJECTED", "EXPIRED"].includes(status),
    status: status || "PENDING",
    amount: toAmount(tx?.amount),
    currency: tx?.currency?.code || tx?.currency || null,
    metadata: tx?.metadata || {},
    customer: {
      name: [tx?.customer?.first_name, tx?.customer?.last_name].filter(Boolean).join(" ") || undefined,
      email: tx?.customer?.email,
      phone: tx?.customer?.phone,
    },
  };
}

// ─── Finalisation idempotente d'une commande ───

export interface FinalizeResult {
  ok: boolean;
  orderId?: string;
  alreadyCompleted?: boolean;
  reason?: "not_paid" | "failed" | "order_not_found" | "amount_mismatch";
}

/**
 * Passe une commande en "completed" uniquement si :
 *  - le prestataire confirme le paiement (vérifié côté serveur),
 *  - la commande est liée à cette transaction (ou est créée à partir des metadata du prestataire),
 *  - le montant payé couvre le prix du produit en base (code promo revalidé).
 */
export async function finalizePayment(
  supabase: SupabaseClient,
  provider: "Nyole" | "Moneroo",
  transactionId: string,
  verified: VerifiedPayment,
): Promise<FinalizeResult> {
  if (verified.failed) return { ok: false, reason: "failed" };
  if (!verified.paid) return { ok: false, reason: "not_paid" };

  const meta = verified.metadata || {};

  // 1. Retrouver la commande liée à la transaction
  let { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("pawapay_deposit_id", transactionId)
    .maybeSingle();

  if (!order) {
    const metaOrderId = meta.order_id || meta.purchase_id;
    if (metaOrderId && UUID_RE.test(String(metaOrderId))) {
      const { data: o } = await supabase.from("orders").select("*").eq("id", metaOrderId).maybeSingle();
      // Une commande déjà liée à une autre transaction ne peut pas être réutilisée
      if (o && (!o.pawapay_deposit_id || o.pawapay_deposit_id === transactionId)) order = o;
    }
  }

  // 2. Aucune commande en base : la créer à partir des metadata du prestataire (en attente)
  if (!order && meta.product_id && UUID_RE.test(String(meta.product_id))) {
    const { data: prod } = await supabase
      .from("products")
      .select("id, creator_id")
      .eq("id", meta.product_id)
      .maybeSingle();
    if (prod) {
      let customerId: string | null = null;
      const email = verified.customer.email?.trim().toLowerCase();
      if (email) {
        const { data: cust } = await supabase
          .from("customers")
          .upsert(
            { name: verified.customer.name || email, email, phone: verified.customer.phone || null },
            { onConflict: "email" },
          )
          .select("id")
          .maybeSingle();
        customerId = cust?.id || null;
      }
      const { data: ins } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          product_id: prod.id,
          store_owner_id: prod.creator_id,
          amount: 0,
          promo_code: meta.promo_code || null,
          shipping_address: meta.shipping_address || null,
          status: "pending",
          payment_method: provider,
          pawapay_deposit_id: transactionId,
        })
        .select("*")
        .maybeSingle();
      order = ins;
    }
  }

  if (!order) return { ok: false, reason: "order_not_found" };
  if (order.status === "completed") return { ok: true, orderId: order.id, alreadyCompleted: true };

  // 3. Contrôle du montant par rapport au prix en base
  const { data: product } = await supabase
    .from("products")
    .select("id, title, price, creator_id, download_url, type")
    .eq("id", order.product_id)
    .maybeSingle();
  if (!product) return { ok: false, reason: "order_not_found", orderId: order.id };

  const { expected, original, promoCode } = await computeExpectedAmount(supabase, product, order.promo_code);
  if (verified.amount === null || verified.amount < expected) {
    console.error("[payments] Montant insuffisant", {
      orderId: order.id,
      transactionId,
      paid: verified.amount,
      expected,
    });
    return { ok: false, reason: "amount_mismatch", orderId: order.id };
  }

  // 4. Passage en "completed" (conditionnel pour éviter les doubles traitements)
  const { data: updated } = await supabase
    .from("orders")
    .update({
      status: "completed",
      amount: verified.amount,
      original_amount: promoCode ? original : order.original_amount,
      promo_code: promoCode,
      payment_method: provider,
      pawapay_deposit_id: transactionId,
      ...(provider === "Moneroo" ? { moneroo_transaction_id: transactionId } : {}),
    })
    .eq("id", order.id)
    .neq("status", "completed")
    .select("*")
    .maybeSingle();

  if (!updated) return { ok: true, orderId: order.id, alreadyCompleted: true };

  // 5. Compteur d'utilisation du code promo
  if (promoCode) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("current_uses")
      .eq("code", promoCode)
      .eq("creator_id", product.creator_id)
      .maybeSingle();
    if (promo) {
      await supabase
        .from("promo_codes")
        .update({ current_uses: (promo.current_uses || 0) + 1 })
        .eq("code", promoCode)
        .eq("creator_id", product.creator_id);
    }
  }

  // 6. Emails / notifications — données issues de la base uniquement
  try {
    const { data: customer } = await supabase
      .from("customers")
      .select("name, email")
      .eq("id", updated.customer_id)
      .maybeSingle();
    await supabase.functions.invoke("notify-sale", {
      headers: process.env.INTERNAL_FUNCTIONS_SECRET
        ? { "x-internal-secret": process.env.INTERNAL_FUNCTIONS_SECRET }
        : undefined,
      body: {
        store_owner_id: updated.store_owner_id,
        product_title: product.title || "Produit",
        amount: updated.amount,
        customer_name: customer?.name || "Client",
        customer_email: customer?.email || null,
        promo_code: updated.promo_code,
        original_price: updated.original_amount,
        product_id: updated.product_id,
        download_url: product.download_url || null,
        product_type: product.type || null,
        order_id: updated.id,
        payment_method: provider,
      },
    });
  } catch (notifyErr) {
    console.warn("[payments] notify-sale invocation error:", notifyErr);
  }

  return { ok: true, orderId: updated.id, alreadyCompleted: false };
}
