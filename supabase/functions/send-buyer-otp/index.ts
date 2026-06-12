const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email requis" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if this email has a customer record (has purchased something)
    const { data: customer } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (!customer) {
      return new Response(JSON.stringify({ error: "Aucun achat trouvé pour cet email" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Invalidate previous codes
    await supabase
      .from("buyer_otps")
      .update({ used: true })
      .eq("email", email.toLowerCase().trim())
      .eq("used", false);

    // Store new code
    await supabase.from("buyer_otps").insert({
      email: email.toLowerCase().trim(),
      code,
      expires_at: expiresAt,
    });

    // Send via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Service email non configuré" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Technova <noreply@technovalearning.com>",
        to: [email],
        subject: `Votre code de connexion : ${code}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #f0f0f0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://portal.technovalearning.com/favicon.png" alt="TECHNOVA" width="56" height="56" style="display:block;margin:0 auto;border-radius:12px; object-fit: contain;" />
              <h2 style="margin: 16px 0 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">TECHNOVA</h2>
            </div>
            <p style="color: #334155; font-size: 16px; line-height: 24px;">Bonjour,</p>
            <p style="color: #334155; font-size: 16px; line-height: 24px;">Voici votre code de connexion sécurisé pour accéder à votre tableau de bord et retrouver tous vos achats :</p>
            <div style="text-align: center; margin: 36px 0;">
              <div style="display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px 36px; border-radius: 16px; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #4f46e5; font-family: monospace; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                ${code}
              </div>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 30px;">Ce code expire dans <strong>10 minutes</strong>.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; line-height: 18px;">
              Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.<br/>
              L'équipe TECHNOVA
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", errBody);
      return new Response(JSON.stringify({ error: "Erreur d'envoi de l'email" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, customerName: customer.name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
