/**
 * TECHNOVA Commission Rules:
 * - 5%  pour les E-books, Templates et fichiers numériques simples.
 * - 15% pour les formations vidéo enregistrées (VOD non programmées).
 * - 25% pour les formations programmées en direct (Direct Google Meet / Visio).
 */
export function getProductCommissionRate(productOrMarketing: any): number {
  if (!productOrMarketing) return 0.05; // 5% par défaut

  const p = productOrMarketing;
  const m = p?.marketing_sections || p;
  const type = (p?.type || m?.type || "").toLowerCase();
  const category = (p?.category || m?.category || "").toLowerCase();
  const formatType = m?.format_type;
  const liveDate = m?.live_date;

  // 1. Direct Google Meet ou Hybride -> 25%
  if (formatType === "live_meet" || formatType === "hybrid" || !!liveDate) {
    return 0.25;
  }

  // 2. Formations Vidéo VOD -> 15%
  if (type === "course" || type === "formation" || category.includes("course") || category.includes("formation")) {
    return 0.15;
  }

  // 3. E-books, Templates, Fichiers & Produits Numériques -> 5%
  return 0.05;
}

export function calculateOrderNet(
  amount: number,
  productOrMarketing?: any
): { gross: number; commission: number; net: number; ratePct: number } {
  const ratePct = getProductCommissionRate(productOrMarketing);
  const gross = Number(amount) || 0;
  const commission = Math.round(gross * ratePct);
  const net = gross - commission;
  return { gross, commission, net, ratePct: ratePct * 100 };
}
