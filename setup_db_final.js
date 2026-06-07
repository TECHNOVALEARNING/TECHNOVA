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
  CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    crossed_price INTEGER,
    file_url TEXT
  );

  ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  
  DO $$
  BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'products'
          AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
    END IF;
  END
  $$;

  -- Storage setup
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('product_images', 'product_images', true) 
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('product_files', 'product_files', false) 
  ON CONFLICT (id) DO NOTHING;

  -- Storage policies
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for product_images') THEN
        CREATE POLICY "Public read for product_images" ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth insert for product_images') THEN
        CREATE POLICY "Auth insert for product_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product_images');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth insert for product_files') THEN
        CREATE POLICY "Auth insert for product_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product_files');
    END IF;
  END
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
      console.log("✅ Base de données configurée !");
      
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
