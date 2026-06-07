import pkg from 'pg';
const { Client } = pkg;

const password = 'isi57dore38';
const projectRef = 'jcfrlevtrnhrmyovmuza';
const region = 'eu-central-1'; // Supabase default or commonly used one, but I'll iterate through regions like setup_db_final.js

const regions = [
  'eu-west-3', 'eu-west-1', 'eu-west-2', 'eu-central-1', 
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 
  'ca-central-1', 'ap-southeast-1', 'ap-northeast-1', 
  'ap-northeast-2', 'ap-southeast-2', 'sa-east-1', 'ap-south-1' 
];

const sql = `
  CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    moneroo_transaction_id TEXT UNIQUE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
  
  DO $$
  BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'purchases'
          AND policyname = 'Users can view their own purchases'
    ) THEN
        CREATE POLICY "Users can view their own purchases" 
        ON public.purchases FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
  END
  $$;
`;

async function createTable() {
  for (const reg of regions) {
    const connectionString = "postgresql://postgres." + projectRef + ":" + password + "@aws-0-" + reg + ".pooler.supabase.com:6543/postgres";
    const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
    
    try {
      await client.connect();
      console.log("Connected to " + reg);
      await client.query(sql);
      console.log("Purchases table created successfully!");
      await client.end();
      return;
    } catch (err) {
      // ignore
    } finally {
      client.end().catch(()=>{}).then(()=>{});
    }
  }
}

createTable();
