// Passerelle de paiement côté navigateur : tout passe par /api/payment (serveur).
// Le serveur choisit FeexPay en priorité et bascule sur Nyole en cas de problème ;
// aucune clé ni aucun montant n'est décidé ici.

export type GatewayProvider = "feexpay" | "nyole";

export interface FeexpayNetwork {
  id: string;
  label: string;
  /** Le client est redirigé vers une page de l'opérateur (Wave, Orange…) */
  redirect?: boolean;
}

export interface GatewayConfig {
  primary: GatewayProvider;
  feexpay: { enabled: boolean; networks: Record<string, FeexpayNetwork[]> };
  nyole: { enabled: boolean };
}

export interface InitPaymentParams {
  productId: string;
  promoCode?: string | null;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  country: string;
  network?: string | null;
  shippingAddress?: any;
  forceProvider?: GatewayProvider;
}

export interface InitPaymentResult {
  provider: GatewayProvider;
  orderId: string;
  reference: string;
  paymentUrl: string | null;
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  fallback?: boolean;
  /** Pourquoi FeexPay n'a pas été utilisé (diagnostic) */
  fallbackReason?: string | null;
  error?: string;
}

export interface PaymentStatusResult {
  paid: boolean;
  status: string;
  orderId?: string;
  error?: string;
}

let configPromise: Promise<GatewayConfig | null> | null = null;

export function getGatewayConfig(): Promise<GatewayConfig | null> {
  configPromise ??= fetch("/api/payment?action=config")
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  return configPromise;
}

export async function initPayment(p: InitPaymentParams): Promise<InitPaymentResult> {
  const res = await fetch("/api/payment?action=init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: p.productId,
      promo_code: p.promoCode || null,
      customer: {
        first_name: p.customer.firstName,
        last_name: p.customer.lastName,
        email: p.customer.email,
        phone: p.customer.phone,
      },
      country: p.country,
      network: p.network || null,
      shipping_address: p.shippingAddress || null,
      force_provider: p.forceProvider,
      cancel_url: window.location.href,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Impossible d'initialiser le paiement.");
  return {
    provider: data.provider,
    orderId: data.order_id,
    reference: data.reference,
    paymentUrl: data.payment_url || null,
    status: data.status || "PENDING",
    fallback: data.fallback,
    fallbackReason: data.fallback_reason ?? null,
    error: data.error,
  };
}

export async function checkPaymentStatus(provider: GatewayProvider, reference: string): Promise<PaymentStatusResult> {
  const res = await fetch(
    `/api/payment?action=status&provider=${provider}&reference=${encodeURIComponent(reference)}`,
  );
  const data = await res.json().catch(() => ({}));
  return {
    paid: data?.paid === true,
    status: String(data?.status || "PENDING"),
    orderId: data?.order_id,
    error: data?.error,
  };
}
