import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { email, redirectTo } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email manquant' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Service email indisponible' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Generate the password reset link using Supabase Auth Admin API
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectTo || 'https://technovalearning.com/reset-password',
      }
    });

    if (linkErr || !linkData?.properties?.action_link) {
      console.error("Link generation error:", linkErr);
      return new Response(JSON.stringify({ error: 'Impossible de générer le lien de réinitialisation' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resetLink = linkData.properties.action_link;

    // Send the email using Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Technova <noreply@mail.ecom-revolt.com>',
        to: [email],
        subject: `Réinitialisation de votre mot de passe`,
        html: `
          <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; background: linear-gradient(135deg, #5b1ea3, #d4a017); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Technova</h1>
            </div>
            <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 12px;">Réinitialisation de votre mot de passe</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #5b1ea3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
              <a href="${resetLink}" style="color: #5b1ea3; word-break: break-all;">${resetLink}</a>
            </p>
            <p style="color: #777; font-size: 13px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Échec de l'envoi de l'e-mail" }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
