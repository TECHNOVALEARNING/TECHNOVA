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

async function fixForeignKey() {
  for (const region of regions) {
    const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
    
    try {
      await client.connect();
      console.log(`✅ Connexion réussie sur ${region} !`);
      
      const sql = `
        ALTER TABLE public.support_tickets 
        DROP CONSTRAINT IF EXISTS support_tickets_customer_id_fkey;

        ALTER TABLE public.support_tickets 
        ADD CONSTRAINT support_tickets_customer_id_fkey 
        FOREIGN KEY (customer_id) 
        REFERENCES public.customers(id) 
        ON DELETE SET NULL;
        
        -- Reload schema cache
        NOTIFY pgrst, 'reload schema';
      `;
      
      await client.query(sql);
      console.log('✅ Clé étrangère ajoutée et cache Supabase rechargé avec succès !');
      
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

fixForeignKey();
