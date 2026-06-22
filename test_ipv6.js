import pkg from 'pg';
const { Client } = pkg;

const password = 'isi57dore38';
const host = 'db.jcfrlevtrnhrmyovmuza.supabase.co';

async function testIpv6() {
  console.log(`Connecting directly to host: ${host} (port 5432)`);
  const client = new Client({
    user: 'postgres',
    password,
    host,
    port: 5432,
    database: 'postgres',
    connectionTimeoutMillis: 5000
  });
  
  try {
    await client.connect();
    console.log("✅ SUCCESS: Connected directly via IPv6!");
    const { rows } = await client.query('SELECT 1');
    console.log("Query test success:", rows);
    await client.end();
  } catch (err) {
    console.log("❌ Failed direct connection:", err.message);
  } finally {
    client.end().catch(() => {});
  }
}

testIpv6();
