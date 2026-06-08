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
  CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
  
  DO $$
  BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'course_modules'
          AND policyname = 'Anyone can view course modules'
    ) THEN
        CREATE POLICY "Anyone can view course modules" 
        ON public.course_modules FOR SELECT 
        USING (true);
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
