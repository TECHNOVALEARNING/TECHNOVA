import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.jcfrlevtrnhrmyovmuza:isi57dore38@aws-0-eu-west-3.pooler.supabase.com:6543/postgres';

const sql = `
CREATE OR REPLACE FUNCTION get_buyer_orders(p_customer_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', o.id,
      'amount', o.amount,
      'status', o.status,
      'created_at', o.created_at,
      'product', json_build_object(
        'id', p.id,
        'title', p.title,
        'type', p.type,
        'thumbnail_url', p.thumbnail_url,
        'download_url', p.download_url
      ),
      'store_owner', json_build_object(
        'id', pr.id,
        'display_name', pr.display_name,
        'store_slug', pr.store_slug
      )
    ) ORDER BY o.created_at DESC
  ), '[]'::json)
  INTO v_result
  FROM public.orders o
  JOIN public.products p ON p.id = o.product_id
  JOIN public.profiles pr ON pr.id = o.store_owner_id
  WHERE o.customer_id = p_customer_id;
  
  RETURN v_result;
END;
$$;
`;

const client = new Client({ connectionString });
client.connect()
  .then(() => client.query(sql))
  .then(() => { console.log('RPC Created!'); client.end(); })
  .catch(err => { console.error('Error:', err); client.end(); });
