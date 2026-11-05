// Client serveur FeexPay (API v2) — https://docs.feexpay.me
// - Paiement Mobile Money : POST /api/transactions/public/requesttopay/{réseau}
// - Statut               : GET  /api/transactions/public/single/status/{reference}
// La clé API ne doit jamais être exposée au navigateur.
import type { VerifiedPayment } from "./payments";

/** Réseaux FeexPay pris en charge par le site, par pays (code ISO 3 lettres du checkout). */
export const FEEXPAY_NETWORKS: Record<string, { id: string; label: string; redirect?: boolean }[]> = {
  BEN: [
    { id: "mtn", label: "MTN MoMo" },
    { id: "moov", label: "Moov Money" },
    { id: "celtiis_bj", label: "Celtiis Cash" },
  ],
  CIV: [
    { id: "mtn_ci", label: "MTN MoMo" },
    { id: "moov_ci", label: "Moov Money", redirect: true },
    { id: "orange_ci", label: "Orange Money", redirect: true },
    { id: "wave_ci", label: "Wave", redirect: true },
  ],
  TGO: [
    { id: "togocom_tg", label: "Mixx by Yas" },
    { id: "moov_tg", label: "Moov Money" },
  ],
  SEN: [
    { id: "orange_sn", label: "Orange Money", redirect: true },
    { id: "wave_sn", label: "Wave", redirect: true },
    { id: "free_sn", label: "Free Money", redirect: true },
  ],
  COG: [{ id: "mtn_cg", label: "MTN MoMo" }],
  BFA: [
    { id: "moov_bf", label: "Moov Money" },
    { id: "wave_bf", label: "Wave", redirect: true },
  ],
};

export const FEEXPAY_MIN_AMOUNT = 100;
export const FEEXPAY_MAX_AMOUNT = 2_000_000;

export function feexpayConfig() {
  const apiKey = process.env.FEEXPAY_API_KEY || "";
  const shopId = process.env.FEEXPAY_SHOP_ID || "";
  const mode = (process.env.FEEXPAY_MODE || "live").toLowerCase() === "sandbox" ? "sandbox" : "live";
  const baseUrl = (
    process.env.FEEXPAY_BASE_URL ||
    (mode === "sandbox" ? "https://sandbox-api.feexpay.me" : "https://api-v2.feexpay.me")
  ).replace(/\/+$/, "");
  // Liste optionnelle pour restreindre les réseaux actifs (ex. "mtn,moov")
  const allowed = (process.env.FEEXPAY_NETWORKS || "")
    .split(",")
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean);
  const enabled = process.env.FEEXPAY_ENABLED !== "false" && Boolean(apiKey && shopId);
  return { apiKey, shopId, mode, baseUrl, allowed, enabled };
}

/** Réseaux utilisables pour un pays, compte tenu de la configuration. */
export function networksFor(country: string) {
  const { allowed, enabled } = feexpayConfig();
  if (!enabled) return [];
  return (FEEXPAY_NETWORKS[country] || []).filter((n) => !allowed.length || allowed.includes(n.id));
}

export function isFeexpayNetwork(country: string, network: string) {
  return networksFor(country).some((n) => n.id === network);
}

/** FeexPay refuse les caractères spéciaux et limite la description à 40 caractères. */
function cleanText(text: string, max: number) {
  return (text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export class FeexPayError extends Error {
  constructor(
    message: string,
    /** true : panne / configuration côté FeexPay → on bascule sur Nyole */
    public readonly fallback: boolean,
    public readonly httpStatus?: number,
  ) {
    super(message);
  }
}

export interface FeexPayInitResult {
  reference: string;
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  paymentUrl: string | null;
  reason?: string;
}

function normalizeStatus(raw: any): "PENDING" | "SUCCESSFUL" | "FAILED" {
  const s = String(raw || "").toUpperCase();
  if (s === "SUCCESSFUL" || s === "SUCCESS") return "SUCCESSFUL";
  if (s === "FAILED" || s === "CANCELLED" || s === "EXPIRED") return "FAILED";
  return "PENDING"; // PENDING, "IN PENDING STATE"…
}

export async function feexpayRequestToPay(params: {
  network: string;
  amount: number;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  description: string;
  callbackInfo: string;
  returnUrl?: string;
  cancelUrl?: string;
}): Promise<FeexPayInitResult> {
  const { apiKey, shopId, baseUrl } = feexpayConfig();
  if (!apiKey || !shopId) throw new FeexPayError("FeexPay non configuré", true);

  const body: Record<string, any> = {
    shop: shopId,
    amount: Math.round(params.amount),
    phoneNumber: params.phoneNumber.replace(/\D/g, ""),
    first_name: cleanText(params.firstName || "", 40) || undefined,
    last_name: cleanText(params.lastName || "", 40) || undefined,
    description: cleanText(params.description, 40) || undefined,
    callback_info: params.callbackInfo,
  };
  if (params.returnUrl) body.return_url = params.returnUrl;
  if (params.cancelUrl) body.cancel_url = params.cancelUrl;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/transactions/public/requesttopay/${encodeURIComponent(params.network)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (err: any) {
    // Réseau injoignable / délai dépassé
    throw new FeexPayError(`FeexPay injoignable : ${err?.name || "erreur réseau"}`, true);
  }

  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = String(data?.code || data?.error?.code || "");
    // Numéro invalide : erreur du client, pas une panne → pas de bascule silencieuse
    const customerError = res.status === 400 && /PHONE/i.test(code + " " + (data?.message || ""));
    console.error("[feexpay] requesttopay HTTP", res.status, code || data?.message);
    throw new FeexPayError(
      customerError ? "Numéro de téléphone invalide pour ce réseau." : `FeexPay a refusé la requête (${res.status})`,
      !customerError,
      res.status,
    );
  }

  const reference = String(data?.reference || data?.transref || data?.order_id || "");
  if (!reference) throw new FeexPayError("Réponse FeexPay sans référence", true, res.status);

  return {
    reference,
    status: normalizeStatus(data?.status),
    paymentUrl: data?.payment_url || null,
    reason: data?.reason || data?.response_operator?.description?.[0],
  };
}

/** Interroge l'API FeexPay : seule source qui fait foi sur le statut d'une transaction. */
export async function verifyFeexpayTransaction(reference: string): Promise<VerifiedPayment | null> {
  const { apiKey, baseUrl } = feexpayConfig();
  if (!apiKey || !reference) return null;
  try {
    const res = await fetch(
      `${baseUrl}/api/transactions/public/single/status/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!res.ok) {
      console.warn(`[feexpay] status HTTP ${res.status} for ${reference}`);
      return null;
    }
    const d: any = await res.json();
    const status = normalizeStatus(d?.status);
    const amount = Number(d?.amount);
    return {
      paid: status === "SUCCESSFUL",
      failed: status === "FAILED",
      status: status === "SUCCESSFUL" ? "SUCCESS" : status,
      amount: isNaN(amount) ? null : Math.round(amount),
      currency: "XOF",
      // callback_info = id de la commande, renseigné à l'initialisation
      metadata: d?.callback_info ? { order_id: String(d.callback_info) } : {},
      customer: { phone: d?.phoneNumber },
    };
  } catch (err) {
    console.warn("[feexpay] status error", err);
    return null;
  }
}
