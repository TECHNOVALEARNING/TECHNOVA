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
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key, but we have server-side so we could use SERVICE_ROLE_KEY if needed. But anon is fine for simple reads and inserts if policies allow.
  
  // Actually, since we need to insert a purchase record and we are on the server, 
  // it's better to use the service_role key to bypass RLS, OR pass the user's token.
  // Since we don't have the user token easily here, let's use service_role key if available, else anon.
  // Wait, I didn't set up a SERVICE_ROLE_KEY. The anon key will fail the insert if RLS is enabled and policies don't allow it.
  // Let's check RLS on purchases. I created a SELECT policy, but no INSERT policy.
  // So anon key will fail.
  // I need to use the service role key or add an INSERT policy.
  // Let's use service_role key. I'll ask the user to add SUPABASE_SERVICE_ROLE_KEY to Vercel, or I can add an INSERT policy.
  // Actually, Vercel allows us to inject env variables. 
  // Let's just create an INSERT policy on public.purchases so authenticated users can insert their own purchases.
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
      }
    }
  });

  // Fetch product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Generate pending purchase
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      user_id: userId,
      product_id: product.id,
      amount: product.price,
      currency: 'XOF',
      status: 'pending'
    })
    .select()
    .single();

  if (purchaseError) {
    console.error('Purchase insert error:', purchaseError);
    return res.status(500).json({ error: 'Failed to create purchase record' });
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
          user_id: userId
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
