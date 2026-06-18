import pkg from 'pg';
const { Client } = pkg;

const password = 'isi57dore38';
const projectRef = 'jcfrlevtrnhrmyovmuza';

const sql = `
  ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS welcome_video_url TEXT NULL;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_welcome_video_url TEXT NULL;
`;

async function tryConnect() {
  const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
  
  try {
    await client.connect();
    console.log("✅ Connexion directe réussie !");
    
    await client.query(sql);
    console.log("✅ Base de données altérée avec succès !");
    
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ Échec de connexion directe: ${err.message}`);
    return false;
  }
}

tryConnect();
