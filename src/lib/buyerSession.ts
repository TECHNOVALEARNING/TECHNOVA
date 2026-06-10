export interface BuyerSession {
  email: string;
  customerName: string;
  customerId: string;
  authenticatedAt: number;
}

export const getBuyerSession = (): BuyerSession | null => {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem("buyer_session");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<BuyerSession>;

    if (!parsed.email || !parsed.customerId) {
      return null;
    }

    return {
      email: parsed.email,
      customerName: parsed.customerName || "Client",
      customerId: parsed.customerId,
      authenticatedAt: parsed.authenticatedAt || 0,
    };
  } catch {
    return null;
  }
};
