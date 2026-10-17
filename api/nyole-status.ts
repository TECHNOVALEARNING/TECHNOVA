import { finalizePayment, getServiceClient, verifyNyoleSession } from "./_lib/payments";

// Vérifie le statut d'une session Nyole auprès de l'API Nyole et, si elle est payée,
// finalise la commande côté serveur (montant contrôlé par rapport au prix en base).
// Le navigateur ne peut jamais marquer lui-même une commande comme payée.
export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const query = req.query || {};
  let body: any = {};
  if (req.body) {
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      body = {};
    }
  }

  const sessionId = String(query.sessionId || query.session_id || body.sessionId || body.session_id || "");

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required", paid: false, status: "FAILED" });
  }

  try {
    const verified = await verifyNyoleSession(sessionId);
    if (!verified) {
      return res.status(502).json({ error: "Nyole status check error", paid: false, status: "PENDING" });
    }

    if (verified.failed) {
      return res.status(200).json({ success: true, paid: false, status: verified.status });
    }
    if (!verified.paid) {
      return res.status(200).json({ success: true, paid: false, status: "PENDING" });
    }

    const result = await finalizePayment(getServiceClient(), "Nyole", sessionId, verified);
    if (!result.ok) {
      console.error("[nyole-status] Finalisation refusée:", result.reason, sessionId);
      return res.status(200).json({
        success: false,
        paid: false,
        status: result.reason === "amount_mismatch" ? "REJECTED" : "PENDING",
        error:
          result.reason === "amount_mismatch"
            ? "Le montant payé ne correspond pas au prix du produit."
            : undefined,
      });
    }

    return res.status(200).json({
      success: true,
      paid: true,
      status: "SUCCESS",
      order_id: result.orderId,
      amount: verified.amount,
      currency: verified.currency,
    });
  } catch (err: any) {
    console.error("[nyole-status] Server exception:", err);
    return res.status(500).json({
      error: "Internal server error while checking Nyole status",
      paid: false,
      status: "PENDING",
    });
  }
}
