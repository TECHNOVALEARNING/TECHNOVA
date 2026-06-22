import pkg from 'pg';
const { Client } = pkg;

const password = 'isi57dore38';
const projectRef = 'jcfrlevtrnhrmyovmuza';
const region = 'eu-west-3';

const usernames = [
  `postgres.${projectRef}`,
  `postgres.${projectRef}.transaction`,
  `postgres.${projectRef}.session`,
  'postgres'
];

async function test() {
  for (const user of usernames) {
    const connectionString = `postgresql://${user}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    console.log(`Trying username: ${user}`);
    const client = new Client({
      connectionString,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log(`✅ Success with username: ${user}`);
      const { rows } = await client.query('SELECT 1');
      console.log("Query test success:", rows);
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ Failed with username ${user}:`, err.message);
    } finally {
      client.end().catch(() => {});
    }
  }
}

test();
