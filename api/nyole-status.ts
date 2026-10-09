export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const query = req.query || {};
  let body: any = {};
  if (req.body) {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }

  const sessionId = query.sessionId || query.session_id || body.sessionId || body.session_id;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required", paid: false, status: "FAILED" });
  }

  const apiKey =
    process.env.NYOLE_API_KEY ||
    process.env.VITE_NYOLE_PUBLIC_KEY ||
    "af_live_pub_d06f8f992bc452befbc49b7409d257eed7c2a4726ba0a09a";

  const baseUrl = (
    process.env.NYOLE_BASE_URL ||
    process.env.VITE_NYOLE_BASE_URL ||
    "https://app.nyole.com/api/v1"
  ).replace(/\/+$/, "");

  try {
    // 1. Check /checkout/sessions/:id/status
    const statusUrl = `${baseUrl}/checkout/sessions/${sessionId}/status`;
    const response = await fetch(statusUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`[nyole-status] Nyole returned status ${response.status}`);
      const text = await response.text();
      return res.status(response.status).json({
        error: "Nyole status check error",
        details: text,
        paid: false,
        status: "PENDING",
      });
    }

    const data: any = await response.json();
    console.log(`[nyole-status] Status for session ${sessionId}:`, data);

    const isPaid = Boolean(
      data.paid === true || data.status === "SUCCESS" || data.status === "COMPLETED",
    );

    const isFailed = Boolean(
      data.status === "FAILED" ||
      data.status === "CANCELLED" ||
      data.status === "EXPIRED" ||
      data.status === "REJECTED",
    );

    return res.status(200).json({
      success: true,
      paid: isPaid,
      status: isPaid ? "SUCCESS" : isFailed ? data.status || "FAILED" : data.status || "PENDING",
      provider: data.provider || null,
      order_id: data.order_id || null,
      amount: data.amount,
      currency: data.currency,
      raw: data,
    });
  } catch (err: any) {
    console.error("[nyole-status] Server exception:", err);
    return res.status(500).json({
      error: "Internal server error while checking Nyole status",
      message: err.message,
      paid: false,
      status: "PENDING",
    });
  }
}
