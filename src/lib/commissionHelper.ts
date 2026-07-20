/**
 * TECHNOVA Commission Rules:
 * - 15% pour les cours vidéo non programmés (VOD / E-books / Templates / Digital).
 * - 25% pour les cours programmés en direct (Direct Google Meet / Visio).
 */
export function getProductCommissionRate(productOrMarketing: any): number {
  if (!productOrMarketing) return 0.15; // 15% par défaut

  const m = productOrMarketing.marketing_sections || productOrMarketing;
  const formatType = m?.format_type;
  const liveDate = m?.live_date;

  if (formatType === "live_meet" || formatType === "hybrid" || !!liveDate) {
    return 0.25; // 25% pour les cours programmés en Direct Meet
  }

  return 0.15; // 15% pour les cours vidéo VOD non programmés
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
