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

async function testAll() {
  for (const region of regions) {
    const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
    console.log(`Trying region ${region} on port 5432...`);
    const client = new Client({
      connectionString,
      connectionTimeoutMillis: 3000,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log(`✅ SUCCESS: Connected to region ${region} on port 5432!`);
      const { rows } = await client.query('SELECT 1');
      console.log("Query test success:", rows);
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ Failed on ${region}:`, err.message);
    } finally {
      client.end().catch(() => {});
    }
  }
  console.log("Finished trying all regions on port 5432.");
}

testAll();
