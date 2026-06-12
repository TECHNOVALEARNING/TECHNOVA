import pkg from 'pg';
const { Client } = pkg;

const password = 'isi57dore38';
const projectRef = 'jcfrlevtrnhrmyovmuza';
const regions = [
  'eu-west-3', 'eu-west-1', 'eu-west-2', 'eu-central-1', 
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 
  'ca-central-1', 'ap-southeast-1', 'ap-northeast-1', 
  'ap-northeast-2', 'ap-southeast-2', 'sa-east-1', 'ap-south-1' 
];

const sql = `
CREATE OR REPLACE FUNCTION process_free_order(
  p_name text,
  p_email text,
  p_phone text,
  p_product_id uuid,
  p_store_owner_id uuid,
  p_promo_code text,
  p_original_amount numeric,
  p_shipping_address jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id uuid;
  v_order_id uuid;
BEGIN
  -- Upsert customer
  INSERT INTO public.customers (name, email, phone)
  VALUES (p_name, lower(trim(p_email)), p_phone)
  ON CONFLICT (email) DO UPDATE
  SET name = EXCLUDED.name, phone = EXCLUDED.phone
  RETURNING id INTO v_customer_id;

  -- Insert order
  INSERT INTO public.orders (
    customer_id, 
    product_id, 
    store_owner_id, 
    amount, 
    status, 
    promo_code, 
    original_amount, 
    shipping_address
  )
  VALUES (
    v_customer_id,
    p_product_id,
    p_store_owner_id,
    0,
    'completed',
    p_promo_code,
    p_original_amount,
    p_shipping_address
  )
  RETURNING id INTO v_order_id;

  -- Update promo code usage if applicable
  IF p_promo_code IS NOT NULL THEN
    UPDATE public.promo_codes
    SET current_uses = COALESCE(current_uses, 0) + 1
    WHERE code = p_promo_code AND creator_id = p_store_owner_id;
  END IF;

  RETURN json_build_object('success', true, 'customer_id', v_customer_id, 'order_id', v_order_id);
END;
$$;
`;

async function tryConnect() {
  for (const region of regions) {
    const connectionString = "postgresql://postgres." + projectRef + ":" + password + "@aws-0-" + region + ".pooler.supabase.com:6543/postgres";
    const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
    
    try {
      await client.connect();
      console.log("✅ Connexion réussie sur " + region + " !");
      
      await client.query(sql);
      console.log("✅ RPC process_free_order créé !");
      
      await client.end();
      return true;
    } catch (err) {
      // ignore silently to try next region
    } finally {
      client.end().catch(()=>{}).then(()=>{});
    }
  }
  console.log("❌ Échec de connexion.");
  return false;
}

tryConnect();
