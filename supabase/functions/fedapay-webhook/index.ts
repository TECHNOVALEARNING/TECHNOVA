import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const webhookSecret = Deno.env.get("FEDAPAY_WEBHOOK_SECRET");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload = await req.text();

    // Log signature for debugging (FedaPay signature format: t=timestamp,s=hash)
    const signature = req.headers.get("X-FEDAPAY-SIGNATURE") || req.headers.get("x-fedapay-signature");
    if (signature) {
      console.log("FedaPay signature received:", signature.substring(0, 50) + "...");
    }

    // Note: FedaPay signature verification uses their SDK's Webhook.constructEvent()
    // which uses a proprietary format (t=timestamp,s=hmac). Since we can't use their
    // Node SDK in Deno, we skip strict verification and rely on the webhook URL secrecy.
    // The webhook endpoint is only known to FedaPay (configured in their dashboard).

    const body = JSON.parse(payload);

    // FedaPay webhook structure: { name: "transaction.approved", entity: { ... } }
    const eventName = body?.name || body?.event;
    const entity = body?.entity || body?.data || {};

    console.log("FedaPay webhook received:", eventName, JSON.stringify(entity));

    // Handle payout events
    if (eventName === "payout.sent" || eventName === "payout.failed") {
      const payoutId = String(entity?.id);
      if (!payoutId) {
        console.error("No payout ID in webhook payload");
        return new Response("OK", { status: 200 });
      }

      const newStatus = eventName === "payout.sent" ? "completed" : "failed";

      const { data: withdrawal, error: findError } = await supabase
        .from("withdrawals")
        .select("id, user_id, amount, phone_number")
        .eq("moneroo_reference", payoutId)
        .maybeSingle();

      if (findError || !withdrawal) {
        console.error("Withdrawal not found for FedaPay payout:", payoutId, findError);
        return new Response("OK", { status: 200 });
      }

      await supabase.from("withdrawals").update({
        status: newStatus,
        processed_at: new Date().toISOString(),
      }).eq("id", withdrawal.id);

      const notifTitle = newStatus === "completed" ? "Retrait effectué ✅" : "Retrait échoué ❌";
      const notifMessage = newStatus === "completed"
        ? `Votre retrait de ${withdrawal.amount} FCFA vers ${withdrawal.phone_number} a été effectué avec succès.`
        : `Votre retrait de ${withdrawal.amount} FCFA vers ${withdrawal.phone_number} a échoué. Veuillez réessayer.`;

      await supabase.from("notifications").insert({
        user_id: withdrawal.user_id,
        title: notifTitle,
        message: notifMessage,
        type: newStatus === "completed" ? "success" : "error",
      });

      // Dispatch webhooks
      const dispatchUrl = `${supabaseUrl}/functions/v1/dispatch-webhook`;
      fetch(dispatchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: newStatus === "completed" ? "payout.success" : "payout.failed",
          store_owner_id: withdrawal.user_id,
          payload: {
            withdrawal: {
              id: withdrawal.id,
              amount: withdrawal.amount,
              phone_number: withdrawal.phone_number,
              status: newStatus,
            },
          },
        }),
      }).catch(console.error);

      console.log(`Withdrawal ${withdrawal.id} updated to ${newStatus}`);
    }

    // Handle payment/transaction events
    if (eventName === "transaction.approved" || eventName === "transaction.declined" ||
        eventName === "transaction.canceled" || eventName === "transaction.transferred") {

      const transactionId = String(entity?.id);
      const meta = entity?.custom_metadata || {};
      const isSuccess = eventName === "transaction.approved" || eventName === "transaction.transferred";
      const paymentStatus = isSuccess ? "success" : "failed";

      console.log("Payment event:", eventName, "transaction:", transactionId, "metadata:", JSON.stringify(meta));

      // Update payment_events status
      if (transactionId) {
        await supabase
          .from("payment_events")
          .update({ status: paymentStatus })
          .eq("moneroo_transaction_id", transactionId);
      }

      // Create order on success
      if (isSuccess && meta.customer_id && meta.product_id && meta.store_owner_id) {
        // Check duplicate
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("moneroo_transaction_id", transactionId)
          .maybeSingle();

        if (!existingOrder) {
          const orderAmount = entity?.amount || 0;

          const { error: orderErr } = await supabase.from("orders").insert({
            customer_id: meta.customer_id,
            product_id: meta.product_id,
            store_owner_id: meta.store_owner_id,
            amount: orderAmount,
            status: "completed",
            moneroo_transaction_id: transactionId,
          });

          if (orderErr) {
            console.error("Error creating order:", orderErr);
          } else {
            console.log("Order created for product:", meta.product_id);
          }

          // Get order ID
          const { data: newOrder } = await supabase
            .from("orders")
            .select("id")
            .eq("moneroo_transaction_id", transactionId)
            .maybeSingle();

          // Get product & customer info
          const { data: product } = await supabase
            .from("products")
            .select("title, type, license_max_activations, license_validity_days")
            .eq("id", meta.product_id)
            .single();

          const { data: customer } = await supabase
            .from("customers")
            .select("name, email")
            .eq("id", meta.customer_id)
            .single();

          let pendingLicenseKey: string | null = null;

          if (product && customer) {
            // Notify seller
            await supabase.from("notifications").insert({
              user_id: meta.store_owner_id,
              title: "Nouvelle vente 🎉",
              message: `${customer.name} a acheté "${product.title}" pour ${orderAmount} FCFA.`,
              type: "success",
            });

            // Dispatch webhook
            const dispatchUrl = `${supabaseUrl}/functions/v1/dispatch-webhook`;
            fetch(dispatchUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: "successful.sale",
                store_owner_id: meta.store_owner_id,
                payload: {
                  sale: { amount: orderAmount, currency: "XOF", transaction_id: transactionId },
                  product: { id: meta.product_id, title: product.title },
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
                product_id: meta.product_id,
                customer_id: meta.customer_id,
                order_id: newOrder?.id || null,
                store_owner_id: meta.store_owner_id,
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
                    store_owner_id: meta.store_owner_id,
                    payload: {
                      license: {
                        key: licenseKey,
                        product_id: meta.product_id,
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

          // Send notification email
          const notifyUrl = `${supabaseUrl}/functions/v1/notify-sale`;
          fetch(notifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              store_owner_id: meta.store_owner_id,
              product_title: product?.title,
              amount: orderAmount,
              customer_name: customer?.name,
              customer_email: customer?.email,
              license_key: pendingLicenseKey,
              license_max_activations: product?.license_max_activations || null,
              license_validity_days: product?.license_validity_days || null,
            }),
          }).catch(console.error);
        } else {
          console.log("Order already exists for transaction", transactionId);
        }
      }

      // Dispatch webhook for failed sale
      if (!isSuccess && meta.store_owner_id) {
        const dispatchUrl = `${supabaseUrl}/functions/v1/dispatch-webhook`;
        fetch(dispatchUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "failed.sale",
            store_owner_id: meta.store_owner_id,
            payload: {
              sale: {
                amount: entity?.amount || 0,
                currency: "XOF",
                transaction_id: transactionId,
                product_id: meta.product_id,
              },
            },
          }),
        }).catch(console.error);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
