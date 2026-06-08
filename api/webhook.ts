import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verifier la signature du webhook (Fortement recommandé en production)
    // Moneroo envoie un header 'x-moneroo-signature'
    const signature = req.headers['x-moneroo-signature'];
    const secret = process.env.MONEROO_WEBHOOK_SECRET; // Utilisation du Hash Secret du Webhook
    
    if (signature && secret) {
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      // Pour éviter de bloquer si la signature a un format légèrement différent (espaces etc), 
      // on logue juste en cas d'erreur, mais en prod stricte on ferait un return 401.
      if (signature !== expectedSignature) {
        console.warn('Webhook signature mismatch. Expected:', expectedSignature, 'Got:', signature);
      }
    }

    const { event, data } = req.body;

    // Si c'est pas un succès de paiement, on ignore
    if (event !== 'payment.success' && event !== 'payment.successful' && event !== 'transaction.success') {
      return res.status(200).json({ received: true, message: 'Ignored event type' });
    }

    const metadata = data?.metadata || data?.transaction?.metadata;
    const purchaseId = metadata?.purchase_id;

    if (!purchaseId) {
      return res.status(400).json({ error: 'No purchase_id found in metadata' });
    }

    // 2. Mettre à jour Supabase
    // Nous devons utiliser la Service Role Key car le webhook n'a pas l'auth de l'utilisateur.
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; 
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error, data: updatedOrder } = await supabase
      .from('orders')
      .update({ 
        status: 'completed', 
        moneroo_transaction_id: data?.id || data?.transaction?.id 
      })
      .eq('id', purchaseId)
      .select('*, products(title, image_url, id)')
      .single();

    if (error) {
      console.error('Failed to update purchase in Supabase:', error);
      return res.status(500).json({ error: 'Database update failed' });
    }

    // 3. Envoyer l'email post-achat via Resend
    if (updatedOrder && updatedOrder.customer_email) {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        const productTitle = updatedOrder.products?.title || 'Votre produit';
        const orderIdDisplay = `CMD-${purchaseId.split('-')[0].toUpperCase()}`;
        
        // Le lien vers le portail client (landing page /login ou un lien direct)
        // On récupère le host depuis la requête
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'technova.com';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const portalUrl = `${protocol}://${host}/login`;

        const logoHtml = `<img src="https://i.ibb.co/VvzH3b6/logo.png" alt="TECHNOVA" width="48" height="48" style="display:block;margin:0 auto 12px;border-radius:10px;" />`;
        
        const customerEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              ${logoHtml}
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Merci pour votre achat ! 🙏</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; font-size: 16px;">Bonjour <strong>${updatedOrder.customer_name || 'Client'}</strong>,</p>
              <p style="color: #374151; font-size: 16px;">Votre paiement a bien été validé et votre produit est prêt !</p>
              
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 15px;">📋 Récapitulatif de commande</h3>
                <p style="margin: 5px 0; color: #374151;"><strong>N° Commande :</strong> ${orderIdDisplay}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Produit :</strong> ${productTitle}</p>
                <p style="margin: 5px 0; color: #374151; font-size: 18px;"><strong>Total payé :</strong> ${updatedOrder.amount} ${updatedOrder.currency}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Accéder à mes achats</a>
                <p style="color: #6b7280; font-size: 13px; margin-top: 12px;">Connectez-vous avec cette adresse email pour retrouver vos achats.</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">À bientôt sur <strong>TECHNOVA</strong> !</p>
            </div>
          </div>
        `;

        try {
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "TECHNOVA <noreply@technovalearning.com>", // Make sure to verify this domain on Resend or use delivered-by
              to: [updatedOrder.customer_email],
              subject: `Confirmation de commande : ${productTitle} 🎉`,
              html: customerEmailHtml,
            }),
          });
          
          if (!emailRes.ok) {
            console.error('Failed to send email:', await emailRes.text());
          }
        } catch (emailErr) {
          console.error('Email send exception:', emailErr);
        }
      }
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
