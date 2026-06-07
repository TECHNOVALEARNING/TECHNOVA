import pkg from 'pg';
const { Client } = pkg;

const password = 'isi57dore38';
const projectRef = 'jcfrlevtrnhrmyovmuza';
const regions = [
  'eu-west-3', 
  'eu-west-1', 
  'eu-west-2', 
  'eu-central-1', 
  'us-east-1', 
  'us-east-2', 
  'us-west-1', 
  'us-west-2', 
  'ca-central-1', 
  'ap-southeast-1', 
  'ap-northeast-1', 
  'ap-northeast-2', 
  'ap-southeast-2', 
  'sa-east-1', 
  'ap-south-1' 
];

const sql = `
  -- Update products table with new columns
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS crossed_price INTEGER;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS file_url TEXT;

  -- Create Storage Buckets
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('product_images', 'product_images', true) 
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('product_files', 'product_files', false) 
  ON CONFLICT (id) DO NOTHING;

  -- Create basic policies for storage (we will secure them later when we have the admin email)
  DO $$
  BEGIN
    -- Public read for images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for product_images') THEN
        CREATE POLICY "Public read for product_images" ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
    END IF;
    
    -- Auth insert for images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth insert for product_images') THEN
        CREATE POLICY "Auth insert for product_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product_images');
    END IF;

    -- Auth insert for files
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth insert for product_files') THEN
        CREATE POLICY "Auth insert for product_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product_files');
    END IF;
  END
  $$;
`;

async function tryConnect() {
  for (const region of regions) {
    const connectionString = "postgresql://postgres." + projectRef + ":" + password + "@aws-0-" + region + ".pooler.supabase.com:6543/postgres";
    console.log("Essai sur la région : " + region + "...");
    const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
    
    try {
      await client.connect();
      console.log("✅ Connexion réussie sur " + region + " !");
      
      await client.query(sql);
      console.log("✅ Base de données Admin configurée avec succès !");
      
      await client.end();
      return true;
    } catch (err) {
      console.log("❌ Échec sur " + region + " (" + err.message + ")");
    } finally {
      client.end().catch(()=>{}).then(()=>{});
    }
  }
  return false;
}

tryConnect();
