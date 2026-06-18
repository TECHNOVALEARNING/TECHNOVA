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

async function check() {
  for (const region of regions) {
    const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    console.log(`Trying pooler with SSL on region: ${region}`);
    const client = new Client({ 
      connectionString, 
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false } // Crucial for PgBouncer SNI mapping
    });
    try {
      await client.connect();
      console.log(`✅ Connected successfully to: ${region}`);
      const { rows } = await client.query(`SELECT 1`);
      console.log("Query test success:", rows);
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ Failed on ${region}:`, err.message);
    } finally {
      client.end().catch(() => {});
    }
  }
}

check();
