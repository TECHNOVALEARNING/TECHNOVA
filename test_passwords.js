import pkg from 'pg';
const { Client } = pkg;

const projectRef = 'jcfrlevtrnhrmyovmuza';
const region = 'eu-central-1';

const passwords = [
  'isi57dore38',
  'Isi57dore38',
  'Isi57dore38??',
  'isi57dore38??'
];

const ports = [6543, 5432];

async function testPasswords() {
  for (const password of passwords) {
    for (const port of ports) {
      const user = `postgres.${projectRef}`;
      console.log(`Testing Password: ${password} | Port: ${port}`);
      
      const client = new Client({
        user,
        password,
        host: `aws-0-${region}.pooler.supabase.com`,
        port,
        database: 'postgres',
        connectionTimeoutMillis: 5000,
        ssl: { rejectUnauthorized: false }
      });
      
      try {
        await client.connect();
        console.log(`✅ SUCCESS: Connected with password: ${password} on port: ${port}`);
        const { rows } = await client.query('SELECT 1');
        console.log("Query test success:", rows);
        await client.end();
        return;
      } catch (err) {
        console.log(`❌ Failed:`, err.message);
      } finally {
        client.end().catch(() => {});
      }
    }
  }
}

testPasswords();
