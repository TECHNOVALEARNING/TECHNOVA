import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const headers = req.headers || {};
    const monerooSig = headers["x-moneroo-signature"];
    const nyoleSig = headers["x-nyole-signature"] || headers["x-afriflow-signature"];
    const nyoleTimestamp = headers["x-nyole-timestamp"] || headers["x-afriflow-timestamp"];

    // 1. Signature check for Moneroo
    const monerooSecret = process.env.MONEROO_WEBHOOK_SECRET;
    if (monerooSig && monerooSecret) {
      try {
        const expectedSig = crypto.createHmac("sha256", monerooSecret).update(rawBody).digest("hex");
        if (monerooSig !== expectedSig) {
          console.warn("[Webhook] Moneroo signature mismatch:", { expected: expectedSig, received: monerooSig });
        }
      } catch (sigErr) {
        console.warn("[Webhook] Moneroo signature check error:", sigErr);
      }
    }

    // 2. Signature check for Nyole (optional)
    const nyoleSecret = process.env.NYOLE_WEBHOOK_SECRET || process.env.NYOLE_API_KEY;
    if (nyoleSig && nyoleTimestamp && nyoleSecret) {
      try {
        const parts = String(nyoleSig).split(",");
        const v1Part = parts.find((p) => p.trim().startsWith("v1="));
        if (v1Part) {
          const receivedSig = v1Part.trim().slice(3);
          const expectedSig = crypto
            .createHmac("sha256", nyoleSecret)
            .update(`${nyoleTimestamp}.${rawBody}`)
            .digest("hex");
          if (expectedSig.toLowerCase() !== receivedSig.toLowerCase()) {
            console.warn("[Webhook] Nyole signature mismatch");
          }
        }
      } catch (nyoleSigErr) {
        console.warn("[Webhook] Nyole signature check error:", nyoleSigErr);
      }
    }

    const event = (body.event || body.type || "").toLowerCase();
    const status = (body.status || body.data?.status || body.data?.state || "").toUpperCase();
    const paid = body.paid === true || body.data?.paid === true;

    // Detect if this is a Nyole webhook or payment event
    const isNyole =
      Boolean(nyoleSig) ||
      event.includes("checkout.session") ||
      event.includes("nyole") ||
      body.object === "checkout.session" ||
      body.data?.object === "checkout.session" ||
      body.data?.metadata?.platform === "TECHNOVA" ||
      body.metadata?.platform === "TECHNOVA" ||
      body.payment_method === "Nyole" ||
      body.data?.payment_method === "Nyole";

    const isSuccess =
      event === "payment.completed" ||
      event === "checkout.session.completed" ||
      event === "payment.success" ||
      event === "payment.successful" ||
      event === "transaction.success" ||
      status === "SUCCESS" ||
      status === "COMPLETED" ||
      status === "SUCCESSFUL" ||
      status === "PAID" ||
      paid;

    if (!isSuccess) {
      return res.status(200).json({ received: true, message: "Ignored non-success event", event, status });
    }

    // Extract order reference / purchase ID
    const dataObj = body.data || body;
    const metadata = dataObj.metadata || body.metadata || {};
    const purchaseId =
      metadata.order_id ||
      metadata.purchase_id ||
      dataObj.order_id ||
      body.order_id ||
      body.reference ||
      dataObj.id;

    const rawAmount = dataObj.amount ?? body.amount ?? metadata.amount ?? 0;
    const amount = Math.round(Number(rawAmount) || 0);

    const customerName =
      dataObj.customer_name ||
      dataObj.customer?.name ||
      body.customer_name ||
      body.customer?.name ||
      "Client";
    const customerEmail =
      dataObj.customer_email ||
      dataObj.customer?.email ||
      body.customer_email ||
      body.customer?.email ||
      null;
    const customerPhone =
      dataObj.customer_phone ||
      dataObj.customer?.phone ||
      body.customer_phone ||
      body.customer?.phone ||
      null;

    const productId = metadata.product_id;
    const storeOwnerId = metadata.store_owner_id;
    const promoCode = metadata.promo_code;
    const originalPrice = metadata.original_price ? Math.round(Number(metadata.original_price)) : null;
    const shippingAddress = metadata.shipping_address;
    const paymentMethod = isNyole ? "Nyole" : "Moneroo";
    const depositId = dataObj.id || body.id || null;

    // Connect to Supabase with Service Role Key
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://jcfrlevtrnhrmyovmuza.supabase.co";
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseServiceKey) {
      return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let updatedOrder: any = null;

    // Try finding order by purchaseId (if purchaseId looks like UUID or reference)
    if (purchaseId) {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*, products(*)")
        .eq("id", purchaseId)
        .maybeSingle();

      if (existingOrder) {
        const { data: upd, error: updErr } = await supabase
          .from("orders")
          .update({
            status: "completed",
            amount: amount > 0 ? amount : existingOrder.amount,
            payment_method: paymentMethod,
            pawapay_deposit_id: depositId,
            moneroo_transaction_id: isNyole ? existingOrder.moneroo_transaction_id : depositId,
          })
          .eq("id", purchaseId)
          .select("*, products(*)")
          .maybeSingle();

        if (!updErr && upd) {
          updatedOrder = upd;
        }
      }
    }

    // If order was not found by direct ID (e.g. temporary reference or missing)
    if (!updatedOrder && productId && storeOwnerId) {
      // 1. Upsert customer
      let customerId = null;
      if (customerEmail) {
        const { data: cust } = await supabase
          .from("customers")
          .upsert(
            {
              name: customerName,
              email: customerEmail.trim().toLowerCase(),
              phone: customerPhone,
            },
            { onConflict: "email" }
          )
          .select("id")
          .maybeSingle();
        customerId = cust?.id;
      }

      // 2. Insert completed order
      const { data: insOrder, error: insErr } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          product_id: productId,
          store_owner_id: storeOwnerId,
          amount: amount,
          original_amount: originalPrice,
          promo_code: promoCode || null,
          shipping_address: shippingAddress || null,
          status: "completed",
          payment_method: paymentMethod,
          pawapay_deposit_id: depositId,
        })
        .select("*, products(*)")
        .maybeSingle();

      if (!insErr && insOrder) {
        updatedOrder = insOrder;
      }
    }

    // Update promo code usage count if any
    if (promoCode && storeOwnerId) {
      try {
        const { data: promo } = await supabase
          .from("promo_codes")
          .select("current_uses")
          .eq("code", promoCode)
          .eq("creator_id", storeOwnerId)
          .maybeSingle();
        if (promo) {
          await supabase
            .from("promo_codes")
            .update({ current_uses: (promo.current_uses || 0) + 1 })
            .eq("code", promoCode)
            .eq("creator_id", storeOwnerId);
        }
      } catch (pErr) {
        console.warn("[Webhook] Promo update warning:", pErr);
      }
    }

    // Trigger notify-sale edge function for buyer/seller emails
    if (updatedOrder) {
      try {
        await supabase.functions.invoke("notify-sale", {
          body: {
            store_owner_id: updatedOrder.store_owner_id,
            product_title: updatedOrder.products?.title || "Produit",
            amount: updatedOrder.amount,
            customer_name: customerName,
            customer_email: customerEmail,
            promo_code: updatedOrder.promo_code,
            original_price: updatedOrder.original_amount,
            product_id: updatedOrder.product_id,
            download_url: updatedOrder.products?.download_url || null,
            product_type: updatedOrder.products?.type || null,
            order_id: updatedOrder.id,
            payment_method: paymentMethod,
          },
        });
      } catch (notifyErr) {
        console.warn("[Webhook] notify-sale invocation error:", notifyErr);
      }
    }

    return res.status(200).json({
      success: true,
      order_id: updatedOrder?.id || purchaseId,
      amount: updatedOrder?.amount || amount,
    });
  } catch (err: any) {
    console.error("[Webhook] Processing exception:", err);
    return res.status(500).json({ error: "Webhook processing failed", message: err?.message });
  }
}
