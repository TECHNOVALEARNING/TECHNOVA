import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, userId, email, firstName, lastName } = req.body;

  if (!productId || !email) {
    return res.status(400).json({ error: 'Missing productId or email' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  // Use service_role_key if available, else anon key
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; 
  
  const headers: any = {};
  if (req.headers.authorization && req.headers.authorization !== 'Bearer undefined') {
    headers.Authorization = req.headers.authorization;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: headers
    }
  });

  // Fetch product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return res.status(404).json({ error: 'Product not found', details: productError });
  }

  // Generate pending purchase
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      user_id: userId || null,
      product_id: product.id,
      amount: product.price,
      currency: 'XOF',
      status: 'pending'
    })
    .select()
    .single();

  if (purchaseError) {
    console.error('Purchase insert error:', purchaseError);
    return res.status(500).json({ error: 'Failed to create purchase record', details: purchaseError });
  }

  // Call Moneroo
  const monerooSecretKey = process.env.MONEROO_SECRET_KEY;
  if (!monerooSecretKey) {
    return res.status(500).json({ error: 'Moneroo Secret Key is not configured' });
  }

  // Host can be localhost or vercel domain
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const returnUrl = `${protocol}://${host}/success?purchaseId=${purchase.id}`;

  try {
    const response = await fetch('https://api.moneroo.io/v1/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${monerooSecretKey}`
      },
      body: JSON.stringify({
        amount: product.price,
        currency: 'XOF',
        description: `Achat de: ${product.title}`,
        customer: {
          email: email,
          first_name: firstName || 'Client',
          last_name: lastName || 'Technova'
        },
        return_url: returnUrl,
        metadata: {
          purchase_id: purchase.id,
          product_id: product.id,
          user_id: userId || 'guest'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Moneroo API Error:', data);
      return res.status(response.status).json({ error: 'Payment gateway error', details: data });
    }

    return res.status(200).json({ checkout_url: data.data.checkout_url });
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
