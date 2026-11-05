// Point d'entrée unique des paiements payants (un seul fichier pour rester sous la
// limite de fonctions Vercel) :
//   GET  /api/payment?action=config        → passerelles actives et réseaux FeexPay
//   POST /api/payment?action=init          → crée la commande et lance le paiement
//   GET  /api/payment?action=status&...    → vérifie et finalise côté serveur
//
// Priorité : FeexPay. Si FeexPay est indisponible, mal configuré ou refuse la requête
// (hors erreur du client), on bascule automatiquement sur Nyole (page de paiement hébergée).
// Le montant est toujours recalculé à partir du prix en base (promo revalidée).
import {
  computeExpectedAmount,
  finalizePayment,
  getServiceClient,
  verifyNyoleSession,
} from "./_lib/payments";
import {
  FEEXPAY_MAX_AMOUNT,
  FEEXPAY_MIN_AMOUNT,
  FeexPayError,
  feexpayConfig,
  feexpayRequestToPay,
  isFeexpayNetwork,
  networksFor,
  verifyFeexpayTransaction,
  FEEXPAY_NETWORKS,
} from "./_lib/feexpay";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function primaryProvider(): "feexpay" | "nyole" {
  const wanted = (process.env.PAYMENT_PRIMARY_PROVIDER || "feexpay").toLowerCase();
  return wanted === "nyole" || !feexpayConfig().enabled ? "nyole" : "feexpay";
}

function nyoleConfig() {
  const apiKey = process.env.NYOLE_API_KEY || process.env.VITE_NYOLE_PUBLIC_KEY || "";
  const baseUrl = (process.env.NYOLE_BASE_URL || "https://app.nyole.com/api/v1").replace(/\/+$/, "");
  return { apiKey, baseUrl, enabled: Boolean(apiKey) && process.env.NYOLE_ENABLED !== "false" };
}

async function readBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8") || "{}");
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function siteOrigin(req: any): string {
  const configured = process.env.SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host || "www.technovalearning.com";
  const proto = String(host).startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

async function createNyoleSession(p: {
  orderId: string;
  amount: number;
  productId: string;
  storeOwnerId: string;
  promoCode: string | null;
  originalPrice: number | null;
  customer: { name: string; email: string; phone?: string };
  description: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const { apiKey, baseUrl, enabled } = nyoleConfig();
  if (!enabled) throw new Error("Nyole non configuré");
  const res = await fetch(`${baseUrl}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Idempotency-Key": `order-${p.orderId}`,
    },
    body: JSON.stringify({
      amount: p.amount,
      currency: "XOF",
      customer_name: p.customer.name,
      customer_email: p.customer.email,
      customer_phone: p.customer.phone,
      description: p.description,
      success_url: p.successUrl,
      cancel_url: p.cancelUrl,
      metadata: {
        order_id: p.orderId,
        product_id: p.productId,
        store_owner_id: p.storeOwnerId,
        promo_code: p.promoCode,
        original_price: p.originalPrice,
        platform: "TECHNOVA",
      },
      merchant_name: "TECHNOVA",
    }),
    signal: AbortSignal.timeout(25_000),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok || !data?.url || !data?.id) {
    console.error("[payment] Nyole session error", res.status, data?.message || data?.error);
    throw new Error("Impossible d'initialiser le paiement Nyole.");
  }
  return { sessionId: String(data.id), checkoutUrl: String(data.url) };
}

// ─── Actions ───

function handleConfig(res: any) {
  const networks: Record<string, { id: string; label: string; redirect?: boolean }[]> = {};
  for (const country of Object.keys(FEEXPAY_NETWORKS)) {
    const list = networksFor(country);
    if (list.length) networks[country] = list;
  }
  return res.status(200).json({
    primary: primaryProvider(),
    feexpay: { enabled: feexpayConfig().enabled, mode: feexpayConfig().mode, networks },
    nyole: { enabled: nyoleConfig().enabled },
  });
}

async function handleInit(req: any, res: any) {
  const body = await readBody(req);
  const productId = String(body.product_id || "");
  const customer = body.customer || {};
  const email = String(customer.email || "").trim().toLowerCase();
  const firstName = String(customer.first_name || "").trim();
  const lastName = String(customer.last_name || "").trim();
  const phone = String(customer.phone || "").replace(/\D/g, "");
  const country = String(body.country || "").toUpperCase();
  const network = String(body.network || "").toLowerCase();
  const forceNyole = body.force_provider === "nyole";

  if (!UUID_RE.test(productId)) return res.status(400).json({ error: "Produit invalide." });
  if (!email.includes("@")) return res.status(400).json({ error: "Email invalide." });

  const supabase = getServiceClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, title, price, creator_id")
    .eq("id", productId)
    .maybeSingle();
  if (!product) return res.status(404).json({ error: "Produit introuvable." });

  const { expected, original, promoCode } = await computeExpectedAmount(supabase, product, body.promo_code);
  if (expected <= 0) return res.status(400).json({ error: "Ce produit est gratuit." });

  // Client + commande en attente (le montant vient de la base, jamais du navigateur)
  const name = `${firstName} ${lastName}`.trim() || email;
  const { data: cust } = await supabase
    .from("customers")
    .upsert({ name, email, phone: phone ? `+${phone}` : "" }, { onConflict: "email" })
    .select("id")
    .maybeSingle();
  if (!cust?.id) return res.status(500).json({ error: "Impossible d'enregistrer le client." });

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_id: cust.id,
      product_id: product.id,
      store_owner_id: product.creator_id,
      amount: expected,
      original_amount: promoCode ? original : null,
      promo_code: promoCode,
      shipping_address: body.shipping_address || null,
      status: "pending",
    })
    .select("id")
    .single();
  if (orderErr || !order) {
    console.error("[payment] order insert", orderErr);
    return res.status(500).json({ error: "Impossible de créer la commande." });
  }

  const origin = siteOrigin(req);
  const returnUrl = `${origin}/payment-callback?order_id=${order.id}&product_id=${product.id}`;
  const cancelUrl = typeof body.cancel_url === "string" && body.cancel_url.startsWith(origin) ? body.cancel_url : origin;
  const description = `TECHNOVA ${product.title || ""}`;

  // 1. FeexPay en priorité
  let fallbackReason: string | null = null;
  const canUseFeexpay =
    !forceNyole &&
    primaryProvider() === "feexpay" &&
    isFeexpayNetwork(country, network) &&
    expected >= FEEXPAY_MIN_AMOUNT &&
    expected <= FEEXPAY_MAX_AMOUNT &&
    phone.length >= 8;

  if (canUseFeexpay) {
    try {
      const fx = await feexpayRequestToPay({
        network,
        amount: expected,
        phoneNumber: phone,
        firstName,
        lastName,
        description,
        callbackInfo: order.id,
        returnUrl,
        cancelUrl,
      });
      await supabase
        .from("orders")
        .update({ pawapay_deposit_id: fx.reference, payment_method: "FeexPay" })
        .eq("id", order.id);

      return res.status(200).json({
        provider: "feexpay",
        order_id: order.id,
        reference: fx.reference,
        payment_url: fx.paymentUrl,
        status: fx.status,
        error: fx.status === "FAILED" ? fx.reason || "Paiement refusé par l'opérateur." : undefined,
      });
    } catch (err: any) {
      if (err instanceof FeexPayError && !err.fallback) {
        // Erreur du client (ex. numéro invalide) : on l'affiche, sans changer de passerelle
        await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
        return res.status(400).json({ error: err.message, provider: "feexpay" });
      }
      fallbackReason = err?.message || "FeexPay indisponible";
      console.warn("[payment] Bascule FeexPay → Nyole :", fallbackReason);
    }
  } else if (!forceNyole && primaryProvider() === "feexpay") {
    fallbackReason = "Réseau ou montant non pris en charge par FeexPay";
  }

  // 2. Repli : Nyole (page hébergée, tous moyens de paiement)
  try {
    const ny = await createNyoleSession({
      orderId: order.id,
      amount: expected,
      productId: product.id,
      storeOwnerId: product.creator_id,
      promoCode,
      originalPrice: promoCode ? original : null,
      customer: { name, email, phone: phone ? `+${phone}` : undefined },
      description: `Commande #${order.id.slice(0, 8)} - TECHNOVA`,
      successUrl: returnUrl,
      cancelUrl,
    });
    await supabase
      .from("orders")
      .update({ pawapay_deposit_id: ny.sessionId, payment_method: "Nyole" })
      .eq("id", order.id);
    return res.status(200).json({
      provider: "nyole",
      order_id: order.id,
      reference: ny.sessionId,
      payment_url: ny.checkoutUrl,
      status: "PENDING",
      fallback: Boolean(fallbackReason),
      fallback_reason: fallbackReason,
    });
  } catch (err: any) {
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    console.error("[payment] Aucune passerelle disponible", fallbackReason, err?.message);
    return res.status(502).json({ error: "Le paiement est momentanément indisponible. Réessayez dans un instant." });
  }
}

async function handleStatus(req: any, res: any) {
  const q = req.query || {};
  const provider = String(q.provider || "").toLowerCase();
  const reference = String(q.reference || "");
  if (!reference || (provider !== "feexpay" && provider !== "nyole")) {
    return res.status(400).json({ error: "provider et reference requis", paid: false, status: "FAILED" });
  }

  const verified = provider === "feexpay" ? await verifyFeexpayTransaction(reference) : await verifyNyoleSession(reference);
  if (!verified) return res.status(200).json({ paid: false, status: "PENDING" });
  if (verified.failed) return res.status(200).json({ paid: false, status: "FAILED" });
  if (!verified.paid) return res.status(200).json({ paid: false, status: "PENDING" });

  const result = await finalizePayment(getServiceClient(), provider === "feexpay" ? "FeexPay" : "Nyole", reference, verified);
  if (!result.ok) {
    console.error("[payment] Finalisation refusée:", result.reason, reference);
    return res.status(200).json({
      paid: false,
      status: result.reason === "amount_mismatch" ? "REJECTED" : "PENDING",
      error: result.reason === "amount_mismatch" ? "Le montant payé ne correspond pas au prix du produit." : undefined,
    });
  }
  return res.status(200).json({ paid: true, status: "SUCCESS", order_id: result.orderId });
}

export default async function handler(req: any, res: any) {
  const action = String((req.query || {}).action || "");
  try {
    if (req.method === "GET" && action === "config") return handleConfig(res);
    if (req.method === "GET" && action === "status") return await handleStatus(req, res);
    if (req.method === "POST" && action === "init") return await handleInit(req, res);
    return res.status(404).json({ error: "Action inconnue" });
  } catch (err: any) {
    console.error("[payment] exception", action, err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
