import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const eventName = body?.event;
    const tokenPay = body?.tokenPay;

    console.log("MoneyFusion payin webhook received:", eventName, JSON.stringify(body));

    if (!tokenPay) {
      console.error("No tokenPay in webhook payload");
      return new Response("OK", { status: 200 });
    }

    // Extract metadata from personal_Info
    const personalInfo = body?.personal_Info?.[0] || {};
    const customerId = personalInfo.customer_id;
    const productId = personalInfo.product_id;
    const storeOwnerId = personalInfo.store_owner_id;
    const promoCode = personalInfo.promo_code || null;
    const originalPrice = personalInfo.original_price || null;
    const montant = body?.Montant || 0;

    // Ignore pending events - only process completed/cancelled
    if (eventName === "payin.session.pending") {
      console.log("Pending event ignored for token:", tokenPay);
      return new Response("OK", { status: 200 });
    }

    const isSuccess = eventName === "payin.session.completed";
    const paymentStatus = isSuccess ? "success" : "failed";

    // Check if already processed (avoid duplicates per MoneyFusion docs)
    const { data: existingEvent } = await supabase
      .from("payment_events")
      .select("status")
      .eq("moneroo_transaction_id", tokenPay)
      .maybeSingle();

    if (existingEvent && existingEvent.status === paymentStatus) {
      console.log("Event already processed for token:", tokenPay, "status:", paymentStatus);
      return new Response("OK", { status: 200 });
    }

    // Update payment_events status
    await supabase
      .from("payment_events")
      .update({ status: paymentStatus })
      .eq("moneroo_transaction_id", tokenPay);

    // Create order on success
    if (isSuccess && customerId && productId && storeOwnerId) {
      // Check duplicate order
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("moneroo_transaction_id", tokenPay)
        .maybeSingle();

      if (!existingOrder) {
        const orderAmount = montant || 0;

        const { error: orderErr } = await supabase.from("orders").insert({
          customer_id: customerId,
          product_id: productId,
          store_owner_id: storeOwnerId,
          amount: orderAmount,
          status: "completed",
          moneroo_transaction_id: tokenPay,
          promo_code: promoCode,
          original_amount: originalPrice,
        });

        if (orderErr) {
          console.error("Error creating order:", orderErr);
        } else {
          console.log("Order created for product:", productId);
        }

        // Get order ID
        const { data: newOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("moneroo_transaction_id", tokenPay)
          .maybeSingle();

        // Get product & customer info
        const { data: product } = await supabase
          .from("products")
          .select("title, type, download_url, license_max_activations, license_validity_days")
          .eq("id", productId)
          .single();

        const { data: customer } = await supabase
          .from("customers")
          .select("name, email")
          .eq("id", customerId)
          .single();

        let pendingLicenseKey: string | null = null;

        if (product && customer) {
          // Notification is handled by notify-sale to avoid duplicates

          // Dispatch webhook
          const dispatchUrl = `${supabaseUrl}/functions/v1/dispatch-webhook`;
          fetch(dispatchUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "successful.sale",
              store_owner_id: storeOwnerId,
              payload: {
                sale: { amount: orderAmount, currency: "XOF", transaction_id: tokenPay },
                product: { id: productId, title: product.title },
                customer: { name: customer.name, email: customer.email },
              },
            }),
          }).catch(console.error);
        }

        // Auto-generate license for license-type products
        if (product && product.type === "license") {
          try {
            let licenseKey = "";
            let isUnique = false;
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

            while (!isUnique) {
              licenseKey = "";
              for (let seg = 0; seg < 4; seg++) {
                if (seg > 0) licenseKey += "-";
                for (let i = 0; i < 4; i++) {
                  licenseKey += chars.charAt(Math.floor(Math.random() * chars.length));
                }
              }
              const { data: existing } = await supabase
                .from("licenses")
                .select("id")
                .eq("license_key", licenseKey)
                .maybeSingle();
              isUnique = !existing;
            }

            const { error: licenseErr } = await supabase.from("licenses").insert({
              license_key: licenseKey,
              product_id: productId,
              customer_id: customerId,
              order_id: newOrder?.id || null,
              store_owner_id: storeOwnerId,
              status: "pending_activation",
              max_activations: product.license_max_activations || 1,
              validity_days: product.license_validity_days || null,
            });

            if (licenseErr) {
              console.error("Error creating license:", licenseErr);
            } else {
              pendingLicenseKey = licenseKey;

              const dispatchUrl2 = `${supabaseUrl}/functions/v1/dispatch-webhook`;
              fetch(dispatchUrl2, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event: "license.issued",
                  store_owner_id: storeOwnerId,
                  payload: {
                    license: {
                      key: licenseKey,
                      product_id: productId,
                      product_title: product?.title,
                      max_activations: product.license_max_activations || 1,
                      validity_days: product.license_validity_days || null,
                    },
                    customer: customer ? { name: customer.name, email: customer.email } : null,
                  },
                }),
              }).catch(console.error);
            }
          } catch (licErr) {
            console.error("License generation error:", licErr);
          }
        }

        // Get store slug for product link
        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("store_slug")
          .eq("id", storeOwnerId)
          .single();

        // Send notification email
        const notifyUrl = `${supabaseUrl}/functions/v1/notify-sale`;
        fetch(notifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            store_owner_id: storeOwnerId,
            product_title: product?.title,
            amount: orderAmount,
            customer_name: customer?.name,
            customer_email: customer?.email,
            license_key: pendingLicenseKey,
            license_max_activations: product?.license_max_activations || null,
            license_validity_days: product?.license_validity_days || null,
            promo_code: promoCode,
            original_price: originalPrice,
            discount_percent: null,
            discount_amount: originalPrice ? originalPrice - orderAmount : null,
            product_id: productId,
            download_url: product?.download_url || null,
            product_type: product?.type || null,
            store_slug: sellerProfile?.store_slug || null,
          }),
        }).catch(console.error);
      } else {
        console.log("Order already exists for token:", tokenPay);
      }
    }

    // Dispatch webhook for failed sale
    if (!isSuccess && storeOwnerId) {
      const dispatchUrl = `${supabaseUrl}/functions/v1/dispatch-webhook`;
      fetch(dispatchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "failed.sale",
          store_owner_id: storeOwnerId,
          payload: {
            sale: {
              amount: montant,
              currency: "XOF",
              transaction_id: tokenPay,
              product_id: productId,
            },
          },
        }),
      }).catch(console.error);
    }

    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
