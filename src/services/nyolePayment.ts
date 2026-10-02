import { supabase } from "@/integrations/supabase/client";

export interface NyoleCustomer {
  name: string;
  email: string;
  phone?: string;
}

export interface NyolePaymentMetadata {
  product_id: string;
  product_title?: string;
  store_owner_id: string;
  promo_code?: string | null;
  original_price?: number | null;
  shipping_address?: any;
  platform?: string;
}

export interface NyoleInitParams {
  orderId?: string;
  amount: number;
  currency?: string;
  description?: string;
  customer: NyoleCustomer;
  metadata: NyolePaymentMetadata;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface NyoleInitResult {
  success: boolean;
  orderId: string;
  sessionId: string;
  checkoutUrl: string;
  reference?: string;
  error?: string;
}

export interface NyoleStatusResult {
  status: "SUCCESS" | "PENDING" | "FAILED" | "CANCELLED" | string;
  paid: boolean;
  orderId?: string;
  provider?: string | null;
  error?: string;
}

const NYOLE_PUBLIC_KEY =
  import.meta.env.VITE_NYOLE_PUBLIC_KEY ||
  "af_live_pub_d06f8f992bc452befbc49b7409d257eed7c2a4726ba0a09a";

const NYOLE_BASE_URL = (
  import.meta.env.VITE_NYOLE_BASE_URL || "https://app.nyole.com/api/v1"
).replace(/\/+$/, "");

/**
 * Initialise une session de paiement Nyole
 * Tente d'abord la fonction Edge Supabase, avec fallback direct sur l'API Nyole client si nécessaire.
 */
export async function initiateNyolePayment(params: NyoleInitParams): Promise<NyoleInitResult> {
  const {
    orderId,
    amount,
    currency = "XOF",
    description,
    customer,
    metadata,
    returnUrl,
    cancelUrl,
  } = params;

  // 1. Essai via Supabase Edge Function
  try {
    const { data, error } = await supabase.functions.invoke("nyole-init-payment", {
      body: {
        order_id: orderId,
        amount: Math.round(amount),
        currency: currency.toUpperCase(),
        description: description || `Achat TECHNOVA - ${metadata.product_title || ""}`,
        customer,
        metadata,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        apiKey: NYOLE_PUBLIC_KEY,
        baseUrl: NYOLE_BASE_URL,
      },
    });

    if (!error && data?.checkout_url && data?.session_id) {
      return {
        success: true,
        orderId: data.order_id || orderId || "",
        sessionId: data.session_id,
        checkoutUrl: data.checkout_url,
        reference: data.reference,
      };
    }
    console.warn("[NyolePayment] Edge function fallback déclenché:", error || data?.error);
  } catch (edgeErr) {
    console.warn("[NyolePayment] Erreur invocation Edge function:", edgeErr);
  }

  // 2. Fallback direct avec l'API publique Nyole
  try {
    const payload = {
      amount: Math.round(amount),
      currency: currency.toUpperCase(),
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      description: description || `Achat TECHNOVA - ${metadata.product_title || ""}`,
      success_url: returnUrl || window.location.href,
      cancel_url: cancelUrl || window.location.href,
      metadata: {
        order_id: orderId,
        product_id: metadata.product_id,
        store_owner_id: metadata.store_owner_id,
        promo_code: metadata.promo_code,
        original_price: metadata.original_price,
        platform: "TECHNOVA",
      },
      merchant_name: "TECHNOVA",
    };

    const res = await fetch(`${NYOLE_BASE_URL}/checkout/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NYOLE_PUBLIC_KEY}`,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const nyoleData = await res.json().catch(() => null);

    if (!res.ok || !nyoleData?.url) {
      throw new Error(
        nyoleData?.message || nyoleData?.error || "Impossible d'initialiser le paiement Nyole.",
      );
    }

    // Si on a un orderId, lier la session en base
    if (orderId) {
      await supabase
        .from("orders")
        .update({
          pawapay_deposit_id: nyoleData.id,
          payment_method: "Nyole",
        })
        .eq("id", orderId)
        .catch(() => null);
    }

    return {
      success: true,
      orderId: orderId || "",
      sessionId: nyoleData.id,
      checkoutUrl: nyoleData.url,
      reference: nyoleData.order_id,
    };
  } catch (directErr: any) {
    console.error("[NyolePayment] Échec d'initialisation Nyole:", directErr);
    return {
      success: false,
      orderId: orderId || "",
      sessionId: "",
      checkoutUrl: "",
      error: directErr.message || "Erreur de communication avec le serveur de paiement.",
    };
  }
}

/**
 * Vérifie le statut d'une session Nyole
 */
export async function checkNyolePaymentStatus(
  sessionId: string,
  orderId?: string,
): Promise<NyoleStatusResult> {
  // 1. Vérification en base locale si commande terminée
  if (orderId) {
    try {
      const { data: ord } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .maybeSingle();

      if (ord?.status === "completed") {
        return { status: "SUCCESS", paid: true, orderId };
      }
    } catch (e) {
      // Ignorer
    }
  }

  // 2. Appel Edge Function ou API directe Nyole
  try {
    const { data } = await supabase.functions.invoke("nyole-status", {
      body: {
        session_id: sessionId,
        order_id: orderId,
        apiKey: NYOLE_PUBLIC_KEY,
        baseUrl: NYOLE_BASE_URL,
      },
    });

    if (data?.status) {
      const isPaid =
        data.paid === true || data.status === "SUCCESS" || data.status === "COMPLETED";
      return {
        status: isPaid ? "SUCCESS" : data.status,
        paid: isPaid,
        orderId: data.order_id || orderId,
        provider: data.provider,
      };
    }
  } catch (e) {
    console.warn("[NyolePayment] Fallback check status:", e);
  }

  // 3. Fallback direct GET /checkout/sessions/{id}/status
  try {
    const res = await fetch(`${NYOLE_BASE_URL}/checkout/sessions/${sessionId}/status`, {
      headers: {
        Authorization: `Bearer ${NYOLE_PUBLIC_KEY}`,
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const isPaid =
        data.paid === true || data.status === "SUCCESS" || data.status === "COMPLETED";
      return {
        status: isPaid ? "SUCCESS" : data.status,
        paid: isPaid,
        orderId,
        provider: data.provider,
      };
    }
  } catch (directErr) {
    console.error("[NyolePayment] Erreur vérification directe Nyole:", directErr);
  }

  return { status: "PENDING", paid: false, orderId };
}
