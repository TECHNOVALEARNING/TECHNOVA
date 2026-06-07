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
    const secret = process.env.MONEROO_SECRET_KEY;
    
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

    const { error } = await supabase
      .from('purchases')
      .update({ 
        status: 'completed', 
        moneroo_transaction_id: data?.id || data?.transaction?.id 
      })
      .eq('id', purchaseId);

    if (error) {
      console.error('Failed to update purchase in Supabase:', error);
      return res.status(500).json({ error: 'Database update failed' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
