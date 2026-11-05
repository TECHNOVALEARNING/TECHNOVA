import crypto from "crypto";
import {
  finalizePayment,
  getServiceClient,
  readRawBody,
  safeEqual,
  verifyMonerooPayment,
  verifyNyoleSession,
} from "./_lib/payments.js";
import { verifyFeexpayTransaction } from "./_lib/feexpay.js";

// Corps brut requis pour vérifier la signature HMAC
export const config = { api: { bodyParser: false } };

function header(req: any, name: string): string {
  const v = (req.headers || {})[name];
  return Array.isArray(v) ? v[0] : v ? String(v) : "";
}

function verifyMonerooSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.MONEROO_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected.toLowerCase(), signature.trim().toLowerCase());
}

function verifyNyoleSignature(rawBody: string, signature: string, timestamp: string): boolean {
  const secret = process.env.NYOLE_WEBHOOK_SECRET || process.env.NYOLE_API_KEY;
  if (!secret || !signature || !timestamp) return false;
  const v1Part = signature.split(",").find((p) => p.trim().startsWith("v1="));
  if (!v1Part) return false;
  const received = v1Part.trim().slice(3).toLowerCase();
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return safeEqual(expected.toLowerCase(), received);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await readRawBody(req);

    // FeexPay : webhook non signé. L'URL configurée dans le tableau de bord FeexPay
    // contient un secret (…/api/webhook?provider=feexpay&secret=XXX) et la transaction
    // est toujours relue auprès de l'API FeexPay avant toute validation.
    if (String((req.query || {}).provider || "").toLowerCase() === "feexpay") {
      return await handleFeexpayWebhook(req, res, rawBody);
    }

    const monerooSig = header(req, "x-moneroo-signature");
    const nyoleSig = header(req, "x-nyole-signature") || header(req, "x-afriflow-signature");
    const nyoleTimestamp = header(req, "x-nyole-timestamp") || header(req, "x-afriflow-timestamp");

    // 1. Signature obligatoire : toute requête non signée par Nyole ou Moneroo est rejetée
    let provider: "Nyole" | "Moneroo" | null = null;
    if (nyoleSig && verifyNyoleSignature(rawBody, nyoleSig, nyoleTimestamp)) {
      provider = "Nyole";
    } else if (monerooSig && verifyMonerooSignature(rawBody, monerooSig)) {
      provider = "Moneroo";
    }
    if (!provider) {
      console.warn("[Webhook] Requête rejetée : signature absente ou invalide");
      return res.status(401).json({ error: "Invalid signature" });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody || "{}");
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const dataObj = body.data || body;
    const transactionId = String(dataObj.id || dataObj.session_id || body.id || "");
    if (!transactionId) {
      return res.status(200).json({ received: true, message: "Missing transaction id" });
    }

    // 2. Revérification du paiement auprès du prestataire (le corps du webhook ne fait pas foi)
    const verified =
      provider === "Nyole"
        ? await verifyNyoleSession(transactionId)
        : await verifyMonerooPayment(transactionId);

    if (!verified) {
      // Erreur temporaire côté prestataire : 503 pour que le webhook soit renvoyé
      return res.status(503).json({ error: "Payment verification unavailable" });
    }

    if (!verified.paid) {
      return res.status(200).json({ received: true, message: "Ignored non-success event" });
    }

    // Montant : celui renvoyé par l'API ; à défaut celui du webhook signé
    if (verified.amount === null) {
      const signedAmount = Number(dataObj.amount ?? body.amount);
      if (!isNaN(signedAmount) && signedAmount > 0) verified.amount = Math.round(signedAmount);
    }
    if (!verified.metadata || Object.keys(verified.metadata).length === 0) {
      verified.metadata = dataObj.metadata || body.metadata || {};
    }

    const supabase = getServiceClient();
    const result = await finalizePayment(supabase, provider, transactionId, verified);

    if (!result.ok) {
      console.error("[Webhook] Finalisation refusée:", result.reason, transactionId);
      return res.status(200).json({ received: true, success: false });
    }

    return res.status(200).json({ received: true, success: true });
  } catch (err: any) {
    console.error("[Webhook] Processing exception:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleFeexpayWebhook(req: any, res: any, rawBody: string) {
  const secret = process.env.FEEXPAY_WEBHOOK_SECRET || "";
  const provided =
    String((req.query || {}).secret || "") || header(req, "authorization").replace(/^Bearer\s+/i, "");
  if (!secret || !safeEqual(provided, secret)) {
    console.warn("[Webhook] FeexPay : secret absent ou invalide");
    return res.status(401).json({ error: "Unauthorized" });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  // Environnement sandbox ignoré en production (et inversement)
  const mode = (process.env.FEEXPAY_MODE || "live").toLowerCase();
  if (body?.env === "sandbox" && mode !== "sandbox") {
    return res.status(200).json({ received: true, ignored: "sandbox" });
  }

  const reference = String(body?.reference || body?.order_id || "");
  if (!reference) return res.status(200).json({ received: true, message: "Missing reference" });

  const verified = await verifyFeexpayTransaction(reference);
  if (!verified) return res.status(503).json({ error: "Payment verification unavailable" });
  if (!verified.paid) return res.status(200).json({ received: true, status: verified.status });

  const result = await finalizePayment(getServiceClient(), "FeexPay", reference, verified);
  if (!result.ok) console.error("[Webhook] FeexPay finalisation refusée:", result.reason, reference);
  return res.status(200).json({ received: true, success: result.ok });
}
