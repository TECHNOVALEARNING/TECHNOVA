import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const webhookSecret = Deno.env.get("MONEROO_WEBHOOK_SECRET");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload = await req.text();

    // Verify signature if webhook secret is configured
    if (webhookSecret) {
      const signature = req.headers.get("X-Moneroo-Signature") || req.headers.get("x-moneroo-signature");
      if (!signature) {
        console.error("Missing X-Moneroo-Signature header");
        return new Response("Forbidden", { status: 403 });
      }

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
      const computedSignature = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (computedSignature !== signature) {
        console.error("Invalid webhook signature");
        return new Response("Forbidden", { status: 403 });
      }
    }

    const body = JSON.parse(payload);
    const event = body.event;
    const data = body.data;

    console.log("Moneroo webhook received:", event, JSON.stringify(data));

    // Handle payout events
    if (event === "payout.success" || event === "payout.failed") {
      const transactionId = data?.id;
      if (!transactionId) {
        console.error("No transaction ID in webhook payload");
        return new Response("OK", { status: 200 });
      }

      const newStatus = event === "payout.success" ? "completed" : "failed";

      const { data: withdrawal, error: findError } = await supabase
        .from("withdrawals")
        .select("id, user_id, amount, phone_number")
        .eq("moneroo_reference", transactionId)
        .maybeSingle();

      if (findError || !withdrawal) {
        console.error("Withdrawal not found for reference:", transactionId, findError);
        return new Response("OK", { status: 200 });
      }

      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: newStatus,
          processed_at: new Date().toISOString(),
        })
        .eq("id", withdrawal.id);

      if (updateError) {
        console.error("Error updating withdrawal:", updateError);
      }

      const notifTitle = event === "payout.success" ? "Retrait effectué ✅" : "Retrait échoué ❌";
      const notifMessage = event === "payout.success"
        ? `Votre retrait de ${withdrawal.amount} FCFA vers ${withdrawal.phone_number} a été effectué avec succès.`
        : `Votre retrait de ${withdrawal.amount} FCFA vers ${withdrawal.phone_number} a échoué. Veuillez réessayer.`;

      await supabase.from("notifications").insert({
        user_id: withdrawal.user_id,
        title: notifTitle,
        message: notifMessage,
        type: event === "payout.success" ? "success" : "error",
      });

      console.log(`Withdrawal ${withdrawal.id} updated to ${newStatus}`);

      // Dispatch webhooks for payout events
      const dispatchUrl = `${supabaseUrl}/functions/v1/dispatch-webhook`;
      const webhookEvent = event === "payout.success" ? "payout.success" : "payout.failed";
      fetch(dispatchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: webhookEvent,
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
    }

    // Handle payment events
    if (event === "payment.success" || event === "payment.failed") {
      const transactionId = data?.id;
      const meta = data?.metadata || {};
      const paymentStatus = event === "payment.success" ? "success" : "failed";

      console.log("Payment event:", event, "transaction:", transactionId, "metadata:", JSON.stringify(meta));

      // Update payment_events status in realtime
      if (transactionId) {
        const { error: updateErr } = await supabase
          .from("payment_events")
          .update({ status: paymentStatus })
          .eq("moneroo_transaction_id", transactionId);

        if (updateErr) {
          console.error("Error updating payment_event:", updateErr);
        } else {
          console.log("payment_events updated to", paymentStatus, "for transaction", transactionId);
        }
      }

      // Create order on success
      if (event === "payment.success" && meta.customer_id && meta.product_id && meta.store_owner_id) {
        // Check if order already exists by transaction ID (avoid duplicates)
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("moneroo_transaction_id", transactionId)
          .maybeSingle();

        if (!existingOrder) {
          const { error: orderErr } = await supabase.from("orders").insert({
            customer_id: meta.customer_id,
            product_id: meta.product_id,
            store_owner_id: meta.store_owner_id,
            amount: data.amount || 0,
            status: "completed",
            moneroo_transaction_id: transactionId,
          });

          if (orderErr) {
            console.error("Error creating order from webhook:", orderErr);
          } else {
            console.log("Order created from webhook for product:", meta.product_id);
          }

          // Get order ID for license generation
          const { data: newOrder } = await supabase
            .from("orders")
            .select("id")
            .eq("moneroo_transaction_id", transactionId)
            .maybeSingle();

          // Notify seller
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

          if (product && customer) {
            await supabase.from("notifications").insert({
              user_id: meta.store_owner_id,
              title: "Nouvelle vente 🎉",
              message: `${customer.name} a acheté "${product.title}" pour ${data.amount || 0} FCFA.`,
              type: "success",
            });

            // License key will be sent after generation if applicable
            let pendingLicenseKey: string | null = null;

            // Dispatch webhooks for successful sale
            const dispatchUrl = `${supabaseUrl}/functions/v1/dispatch-webhook`;
            fetch(dispatchUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: "successful.sale",
                store_owner_id: meta.store_owner_id,
                payload: {
                  sale: {
                    amount: data.amount || 0,
                    currency: "XOF",
                    transaction_id: transactionId,
                  },
                  product: {
                    id: meta.product_id,
                    title: product.title,
                  },
                  customer: {
                    name: customer.name,
                    email: customer.email,
                  },
                },
              }),
            }).catch(console.error);
          }

          // Auto-generate license key for license-type products
          if (product && product.type === "license") {
            try {
              // Generate unique license key
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
                console.log("License created:", licenseKey, "for product:", meta.product_id);
                pendingLicenseKey = licenseKey;
                
                // Dispatch webhook for license issued
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
                        product_title: product.title,
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
          // Send notification email (with license key if applicable)
          const notifyUrl = `${supabaseUrl}/functions/v1/notify-sale`;
          fetch(notifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              store_owner_id: meta.store_owner_id,
              product_title: product?.title,
              amount: data.amount || 0,
              customer_name: customer?.name,
              customer_email: customer?.email,
              license_key: pendingLicenseKey,
              license_max_activations: product?.license_max_activations || null,
              license_validity_days: product?.license_validity_days || null,
            }),
          }).catch(console.error);
        } else {
          console.log("Order already exists for transaction", transactionId, "skipping duplicate");
        }
      }

      // Dispatch webhook for failed sale
      if (event === "payment.failed" && meta.store_owner_id) {
        const dispatchUrl = `${supabaseUrl}/functions/v1/dispatch-webhook`;
        fetch(dispatchUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "failed.sale",
            store_owner_id: meta.store_owner_id,
            payload: {
              sale: {
                amount: data.amount || 0,
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
