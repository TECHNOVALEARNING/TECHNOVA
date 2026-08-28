import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["ancres707@gmail.com"];

const getAdminUser = async (req: Request, supabaseUrl: string, anonKey: string) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabaseAuth.auth.getUser(authHeader.replace("Bearer ", ""));
  const email = String(data?.user?.email || "").toLowerCase();

  if (error || !data?.user?.id || !ADMIN_EMAILS.includes(email)) return null;
  return { id: String(data.user.id), email };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;

    // ── PUBLIC TRACK VISIT ACTION (No admin login needed, captures all site & store traffic) ──
    if (action === "track_visit") {
      let storeOwnerId = params.store_owner_id;
      if (!storeOwnerId) {
        const { data: fallbackProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .limit(1)
          .maybeSingle();
        storeOwnerId = fallbackProfile?.id || "1d2bf252-8301-4afc-865f-31a210221f83";
      }

      const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("cf-connecting-ip") ||
        params.visitor_id ||
        "anon_" + Math.random().toString(36).substring(2, 10);

      const detectedCountry =
        params.country ||
        req.headers.get("cf-ipcountry") ||
        "Bénin";

      await supabaseAdmin.from("store_visits").insert({
        store_owner_id: storeOwnerId,
        page_path: params.page_path || "/",
        referrer: params.referrer || null,
        user_agent: params.user_agent || req.headers.get("user-agent") || null,
        device_type: params.device_type || "Desktop",
        visitor_ip: clientIp,
        country: detectedCountry,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = await getAdminUser(req, supabaseUrl, anonKey);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DASHBOARD STATS ──
    if (action === "stats") {
      const { data: totalUsers } = await supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", "2026-06-05T00:00:00Z");
      const { count: usersCount } = await supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", "2026-06-05T00:00:00Z");

      // Aggregate all completed or paid orders
      const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("amount, created_at, status")
        .or("status.eq.completed,status.eq.paid,status.eq.success");

      const totalRevenue = orders?.reduce((s, o) => s + Number(o.amount || 0), 0) || 0;
      const { data: feeRow } = await supabaseAdmin
        .from("platform_fees")
        .select("value_pct")
        .eq("key", "technova_commission_pct")
        .maybeSingle();
      const commissionPct = Number(feeRow?.value_pct ?? 5) / 100;
      const totalCommissions = totalRevenue * commissionPct;

      const { count: productsCount } = await supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true });
      const { count: storesCount } = await supabaseAdmin
        .from("stores")
        .select("id", { count: "exact", head: true });

      // Generate continuous 30-day timeline initialized to 0
      const dailySales: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dayStr = d.toISOString().slice(0, 10);
        dailySales[dayStr] = 0;
      }

      // Sales by day (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: recentOrders } = await supabaseAdmin
        .from("orders")
        .select("amount, created_at")
        .or("status.eq.completed,status.eq.paid,status.eq.success")
        .gte("created_at", thirtyDaysAgo);

      recentOrders?.forEach((o) => {
        const day = o.created_at.slice(0, 10);
        if (dailySales[day] !== undefined) {
          dailySales[day] += Number(o.amount || 0);
        } else {
          dailySales[day] = Number(o.amount || 0);
        }
      });

      const { count: pendingWithdrawals } = await supabaseAdmin
        .from("withdrawals")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: pendingKyc } = await supabaseAdmin
        .from("identity_verifications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: openTickets } = await supabaseAdmin
        .from("support_conversations")
        .select("id", { count: "exact", head: true })
        .eq("status", "open");

      // Traffic and analytics from store_visits (last 30 days)
      const { data: visits } = await supabaseAdmin
        .from("store_visits")
        .select("country, device_type, referrer, visitor_ip, created_at")
        .gte("created_at", thirtyDaysAgo);

      const traffic = {
        uniqueVisitors: 0,
        pageViews: 0,
        bounceRate: "0.0%",
        avgDuration: "0s",
        countries: [] as Array<{ name: string; value: number }>,
        searchSources: [] as Array<{ name: string; value: number }>,
        socialSources: [] as Array<{ name: string; value: number }>,
      };

      if (visits && visits.length > 0) {
        traffic.pageViews = visits.length;

        // Group by IP to find unique visitors and page views per visitor
        const ipHits: Record<string, number> = {};
        const ipMinMaxTime: Record<string, { min: number; max: number }> = {};
        const countryCounts: Record<string, number> = {};
        const referrerCounts: Record<string, number> = {};
        const socialCounts: Record<string, number> = {};

        visits.forEach((v) => {
          const ip = v.visitor_ip || "unknown";
          ipHits[ip] = (ipHits[ip] || 0) + 1;

          const time = new Date(v.created_at).getTime();
          if (!ipMinMaxTime[ip]) {
            ipMinMaxTime[ip] = { min: time, max: time };
          } else {
            ipMinMaxTime[ip].min = Math.min(ipMinMaxTime[ip].min, time);
            ipMinMaxTime[ip].max = Math.max(ipMinMaxTime[ip].max, time);
          }

          // Country aggregation
          const country = v.country || "Bénin";
          countryCounts[country] = (countryCounts[country] || 0) + 1;

          // Referrer parsing
          const ref = (v.referrer || "").toLowerCase();
          if (!ref || ref === "direct") {
            referrerCounts["Direct (Accès direct)"] = (referrerCounts["Direct (Accès direct)"] || 0) + 1;
          } else if (ref.includes("google")) {
            referrerCounts["Google (Search)"] = (referrerCounts["Google (Search)"] || 0) + 1;
          } else if (ref.includes("bing") || ref.includes("yahoo") || ref.includes("duckduckgo")) {
            referrerCounts["Bing / Yahoo / DuckDuckGo"] = (referrerCounts["Bing / Yahoo / DuckDuckGo"] || 0) + 1;
          } else if (ref.includes("whatsapp") || ref.includes("wa.me") || ref.includes("telegram") || ref.includes("t.me")) {
            socialCounts["WhatsApp / Telegram"] = (socialCounts["WhatsApp / Telegram"] || 0) + 1;
          } else if (ref.includes("facebook") || ref.includes("fb.me") || ref.includes("fbclid")) {
            socialCounts["Facebook"] = (socialCounts["Facebook"] || 0) + 1;
          } else if (ref.includes("linkedin") || ref.includes("li_fat_id")) {
            socialCounts["LinkedIn"] = (socialCounts["LinkedIn"] || 0) + 1;
          } else if (ref.includes("tiktok") || ref.includes("ttclid") || ref.includes("instagram")) {
            socialCounts["TikTok / Instagram"] = (socialCounts["TikTok / Instagram"] || 0) + 1;
          } else if (ref.includes("twitter") || ref.includes("t.co") || ref.includes("x.com") || ref.includes("youtube")) {
            socialCounts["Twitter / X / YouTube"] = (socialCounts["Twitter / X / YouTube"] || 0) + 1;
          } else {
            referrerCounts["Liens référents (Referrals)"] = (referrerCounts["Liens référents (Referrals)"] || 0) + 1;
          }
        });

        const uniqueIps = Object.keys(ipHits);
        traffic.uniqueVisitors = uniqueIps.length;

        // Bounce rate calculation
        const bouncedCount = uniqueIps.filter((ip) => ipHits[ip] === 1).length;
        traffic.bounceRate = ((bouncedCount / uniqueIps.length) * 100).toFixed(1) + "%";

        // Average duration calculation
        let totalDurationMs = 0;
        let activeVisitorsCount = 0;
        uniqueIps.forEach((ip) => {
          const diff = ipMinMaxTime[ip].max - ipMinMaxTime[ip].min;
          if (diff > 0) {
            totalDurationMs += diff;
            activeVisitorsCount++;
          }
        });

        if (activeVisitorsCount > 0) {
          const avgSec = Math.round((totalDurationMs / activeVisitorsCount) / 1000);
          const mins = Math.floor(avgSec / 60);
          const secs = avgSec % 60;
          traffic.avgDuration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        } else {
          traffic.avgDuration = "45s";
        }

        // Format Countries
        const totalCountriesCount = Object.values(countryCounts).reduce((a, b) => a + b, 0);
        traffic.countries = Object.entries(countryCounts)
          .map(([name, count]) => ({
            name,
            value: Math.round((count / totalCountriesCount) * 100),
          }))
          .sort((a, b) => b.value - a.value);

        // Format Search Sources
        const totalSearchCount = Object.values(referrerCounts).reduce((a, b) => a + b, 0) || 1;
        traffic.searchSources = Object.entries(referrerCounts)
          .map(([name, count]) => ({
            name,
            value: Math.round((count / totalSearchCount) * 100),
          }))
          .sort((a, b) => b.value - a.value);

        // Format Social Sources
        const totalSocialCount = Object.values(socialCounts).reduce((a, b) => a + b, 0) || 1;
        traffic.socialSources = Object.entries(socialCounts)
          .map(([name, count]) => ({
            name,
            value: Math.round((count / totalSocialCount) * 100),
          }))
          .sort((a, b) => b.value - a.value);
      }

      // Detailed store & product sales breakdown + recent purchases list
      const { data: rawOrders } = await supabaseAdmin
        .from("orders")
        .select("id, amount, created_at, payment_method, status, store_owner_id, product_id, customer_id")
        .order("created_at", { ascending: false });

      const ordersList = rawOrders || [];

      const productIds = Array.from(new Set(ordersList.map((o: any) => o.product_id).filter(Boolean)));
      const customerIds = Array.from(new Set(ordersList.map((o: any) => o.customer_id).filter(Boolean)));
      const ownerIds = Array.from(new Set(ordersList.map((o: any) => o.store_owner_id).filter(Boolean)));

      const [productsRes, customersRes, profilesRes, storesRes] = await Promise.all([
        productIds.length > 0
          ? supabaseAdmin.from("products").select("id, title, price, type, category").in("id", productIds)
          : Promise.resolve({ data: [] }),
        customerIds.length > 0
          ? supabaseAdmin.from("customers").select("id, name, email").in("id", customerIds)
          : Promise.resolve({ data: [] }),
        ownerIds.length > 0
          ? supabaseAdmin
              .from("profiles")
              .select("id, display_name, store_slug, first_name, last_name")
              .in("id", ownerIds)
          : Promise.resolve({ data: [] }),
        ownerIds.length > 0
          ? supabaseAdmin
              .from("stores")
              .select("owner_id, name, slug")
              .in("owner_id", ownerIds)
          : Promise.resolve({ data: [] }),
      ]);

      const prodMap = Object.fromEntries((productsRes.data || []).map((p: any) => [p.id, p]));
      const custMap = Object.fromEntries((customersRes.data || []).map((c: any) => [c.id, c]));
      const profMap = Object.fromEntries((profilesRes.data || []).map((pr: any) => [pr.id, pr]));
      const storeMap = Object.fromEntries((storesRes.data || []).map((st: any) => [st.owner_id, st]));

      const recentPurchases = ordersList.map((o: any) => {
        const prod = prodMap[o.product_id];
        const cust = custMap[o.customer_id];
        const prof = profMap[o.store_owner_id];
        const store = storeMap[o.store_owner_id];
        const sellerName =
          store?.name ||
          prof?.display_name ||
          (prof?.first_name ? `${prof.first_name} ${prof.last_name || ""}`.trim() : null) ||
          prof?.store_slug ||
          "Boutique Vendeur";

        return {
          id: o.id,
          amount: Number(o.amount || 0),
          createdAt: o.created_at,
          paymentMethod: o.payment_method || "kkiapay",
          status: o.status || "completed",
          productTitle: prod?.title || "Produit Numérique",
          productPrice: Number(prod?.price || o.amount || 0),
          buyerName: cust?.name || "Client Technova",
          buyerEmail: cust?.email || "-",
          sellerName: sellerName || "Vendeur Technova",
          storeOwnerId: o.store_owner_id || "-",
        };
      });

      const storeSalesMap: Record<
        string,
        {
          storeOwnerId: string;
          storeName: string;
          totalRevenue: number;
          totalOrders: number;
          productsMap: Record<string, { id: string; title: string; price: number; salesCount: number; revenue: number }>;
        }
      > = {};

      ordersList
        .filter((o: any) => o.status === "completed")
        .forEach((o: any) => {
          const ownerId = o.store_owner_id || "unknown";
          const prof = profMap[ownerId];
          const store = storeMap[ownerId];
          const storeName =
            store?.name ||
            prof?.display_name ||
            (prof?.first_name ? `${prof.first_name} ${prof.last_name || ""}`.trim() : null) ||
            prof?.store_slug ||
            "Boutique Vendeur";
          const prodId = o.product_id || "unknown";
          const prod = prodMap[prodId];
          const prodTitle = prod?.title || "Produit Numérique";
          const prodPrice = Number(prod?.price || o.amount || 0);
          const amount = Number(o.amount || 0);

          if (!storeSalesMap[ownerId]) {
            storeSalesMap[ownerId] = {
              storeOwnerId: ownerId,
              storeName,
              totalRevenue: 0,
              totalOrders: 0,
              productsMap: {},
            };
          }

          storeSalesMap[ownerId].totalRevenue += amount;
          storeSalesMap[ownerId].totalOrders += 1;

          if (!storeSalesMap[ownerId].productsMap[prodId]) {
            storeSalesMap[ownerId].productsMap[prodId] = {
              id: prodId,
              title: prodTitle,
              price: prodPrice,
              salesCount: 0,
              revenue: 0,
            };
          }
          storeSalesMap[ownerId].productsMap[prodId].salesCount += 1;
          storeSalesMap[ownerId].productsMap[prodId].revenue += amount;
        });

      const storeSalesBreakdown = Object.values(storeSalesMap)
        .map((st) => ({
          storeOwnerId: st.storeOwnerId,
          storeName: st.storeName,
          totalRevenue: st.totalRevenue,
          totalOrders: st.totalOrders,
          products: Object.values(st.productsMap).sort((a, b) => b.revenue - a.revenue),
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);

      return new Response(
        JSON.stringify({
          usersCount,
          totalRevenue,
          totalCommissions,
          productsCount,
          storesCount,
          dailySales,
          pendingWithdrawals,
          pendingKyc,
          openTickets,
          totalOrders: orders?.length || 0,
          traffic,
          storeSalesBreakdown,
          recentPurchases,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ── ALL WITHDRAWALS ──
    if (action === "list_users") {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select(
          "id, first_name, last_name, display_name, avatar_url, phone, country_code, store_slug, created_at",
        )
        .gte("created_at", "2026-06-05T00:00:00Z")
        .order("created_at", { ascending: false });
      return new Response(JSON.stringify({ users: profiles || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_user_events") {
      const { userId } = params;
      const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("amount, created_at, status")
        .eq("store_owner_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: withdrawals } = await supabaseAdmin
        .from("withdrawals")
        .select("amount, fee, net_amount, created_at, status, operator")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      return new Response(
        JSON.stringify({ orders: orders || [], withdrawals: withdrawals || [] }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (action === "list_withdrawals") {
      const { data: withdrawals } = await supabaseAdmin
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      // Get profile info for each user
      const userIds = [...new Set(withdrawals?.map((w) => w.user_id) || [])];
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, display_name, first_name, last_name, phone")
        .in("id", userIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p) => {
        profileMap[p.id] = p;
      });

      return new Response(
        JSON.stringify({
          withdrawals: withdrawals?.map((w) => ({
            ...w,
            profile: profileMap[w.user_id] || null,
          })),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ── UPDATE WITHDRAWAL STATUS ──
    if (action === "update_withdrawal") {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      const { withdrawalId, status } = params;
      const { error } = await supabaseAdmin
        .from("withdrawals")
        .update({
          status,
          processed_at:
            status === "completed" || status === "rejected" ? new Date().toISOString() : null,
        })
        .eq("id", withdrawalId);
      if (error) throw error;

      // Get withdrawal + user info
      const { data: w } = await supabaseAdmin
        .from("withdrawals")
        .select("user_id, amount, net_amount, operator, phone_number, fee, status")
        .eq("id", withdrawalId)
        .single();
      if (w) {
        // In-app notification
        await supabaseAdmin.from("notifications").insert({
          user_id: w.user_id,
          title: status === "completed" ? "Retrait approuvé ✅" : "Retrait rejeté ❌",
          message:
            status === "completed"
              ? `Votre retrait de ${w.net_amount} FCFA a été approuvé et sera traité sous peu.`
              : `Votre retrait de ${w.net_amount} FCFA a été rejeté. Veuillez contacter le support.`,
          type: status === "completed" ? "success" : "error",
        });

        // Email notification
        if (RESEND_API_KEY) {
          const {
            data: { user: sellerUser },
          } = await supabaseAdmin.auth.admin.getUserById(w.user_id);
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("display_name")
            .eq("id", w.user_id)
            .single();
          const sellerName = profile?.display_name || "Créateur";
          const logoUrl =
            "https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/store-assets/brand/technova-logo.png";

          if (sellerUser?.email) {
            const isApproved = status === "completed";
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, ${isApproved ? "#10b981, #059669" : "#ef4444, #dc2626"}); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <img src="${logoUrl}" alt="Technova" width="48" height="48" style="display:block;margin:0 auto 12px;border-radius:10px;" />
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${isApproved ? "✅ Retrait approuvé" : "❌ Retrait rejeté"}</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                  <p style="color: #374151; font-size: 16px;">Bonjour <strong>${sellerName}</strong>,</p>
                  <p style="color: #374151; font-size: 16px;">${
                    isApproved
                      ? "Votre demande de retrait a été approuvée et sera traitée sous peu."
                      : "Votre demande de retrait a été rejetée. Veuillez contacter le support pour plus d'informations."
                  }</p>
                  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 5px 0; color: #374151;"><strong>Montant :</strong> ${w.net_amount} FCFA</p>
                    <p style="margin: 5px 0; color: #374151;"><strong>Frais :</strong> ${w.fee} FCFA</p>
                    <p style="margin: 5px 0; color: #374151;"><strong>Opérateur :</strong> ${w.operator.toUpperCase()}</p>
                    <p style="margin: 5px 0; color: #374151;"><strong>Numéro :</strong> ${w.phone_number}</p>
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">— L'équipe Technova</p>
                </div>
              </div>
            `;

            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "Technova <noreply@mail.technova.com>",
                to: [sellerUser.email],
                subject: isApproved
                  ? `✅ Retrait de ${w.net_amount} FCFA approuvé`
                  : `❌ Retrait de ${w.net_amount} FCFA rejeté`,
                html: emailHtml,
              }),
            });
            const resData = await res.text();
            if (!res.ok) console.error("Resend withdrawal email error:", resData);
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ALL SUPPORT CONVERSATIONS ──
    if (action === "list_support") {
      const { data: conversations } = await supabaseAdmin
        .from("support_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100);

      return new Response(JSON.stringify({ conversations }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── SUPPORT MESSAGES ──
    if (action === "get_messages") {
      const { conversationId } = params;
      const { data: messages } = await supabaseAdmin
        .from("support_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      return new Response(JSON.stringify({ messages }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── SEND ADMIN REPLY ──
    if (action === "send_reply") {
      const { conversationId, content } = params;
      const { error } = await supabaseAdmin.from("support_messages").insert({
        conversation_id: conversationId,
        content,
        sender_type: "admin",
        sender_id: user.id,
      });
      if (error) throw error;

      await supabaseAdmin
        .from("support_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CLOSE CONVERSATION ──
    if (action === "close_conversation") {
      const { conversationId } = params;
      await supabaseAdmin
        .from("support_conversations")
        .update({ status: "closed", updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST ALL PRODUCTS ──
    if (action === "list_products") {
      const { data: products } = await supabaseAdmin
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      const creatorIds = [...new Set(products?.map((p) => p.creator_id) || [])];
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, display_name, first_name, last_name")
        .in("id", creatorIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p) => {
        profileMap[p.id] = p;
      });

      return new Response(
        JSON.stringify({
          products: products?.map((p) => ({
            ...p,
            creator: profileMap[p.creator_id] || null,
          })),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ── TOGGLE PRODUCT PUBLISH ──
    if (action === "toggle_product") {
      const { productId, isPublished } = params;
      const { error } = await supabaseAdmin
        .from("products")
        .update({ is_published: isPublished })
        .eq("id", productId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE PRODUCT ──
    if (action === "delete_product") {
      const { productId } = params;
      const { error } = await supabaseAdmin.from("products").delete().eq("id", productId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST ALL STORES ──
    if (action === "list_stores") {
      const { data: stores } = await supabaseAdmin
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false });

      const ownerIds = [...new Set(stores?.map((s) => s.owner_id) || [])];
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, display_name, first_name, last_name")
        .in("id", ownerIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p) => {
        profileMap[p.id] = p;
      });

      return new Response(
        JSON.stringify({
          stores: stores?.map((s) => ({
            ...s,
            owner: profileMap[s.owner_id] || null,
          })),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ── ARCHIVE STORE ──
    if (action === "archive_store") {
      const { storeId, isArchived } = params;
      const { error } = await supabaseAdmin
        .from("stores")
        .update({ is_archived: isArchived })
        .eq("id", storeId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
