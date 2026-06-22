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

async function updatePolicies() {
  const connectionString = `postgresql://postgres:isi57dore38@db.jcfrlevtrnhrmyovmuza.supabase.co:5432/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
  
  try {
    await client.connect();
    console.log(`✅ Connected directly to DB host!`);
      
      // Query all policies referencing the old admin email
      const res = await client.query(`
        SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
        FROM pg_policies 
        WHERE qual LIKE '%isidoreagonan@gmail.com%' OR with_check LIKE '%isidoreagonan@gmail.com%';
      `);
      
      console.log(`Found ${res.rows.length} policies to update.`);
      
      for (const row of res.rows) {
        const { schemaname, tablename, policyname, roles, cmd, qual, with_check } = row;
        
        console.log(`Updating policy "${policyname}" on table "${schemaname}.${tablename}"...`);
        
        // 1. Drop the old policy
        const dropSql = `DROP POLICY "${policyname}" ON "${schemaname}"."${tablename}";`;
        console.log(`Running: ${dropSql}`);
        await client.query(dropSql);
        
        // 2. Re-create the policy with the new admin email
        let newQual = qual ? qual.replace(/isidoreagonan@gmail.com/g, 'ancres707@gmail.com') : null;
        let newWithCheck = with_check ? with_check.replace(/isidoreagonan@gmail.com/g, 'ancres707@gmail.com') : null;
        
        // Remove outer parens if qual has them because Postgres might re-add them
        // Reconstruct CREATE POLICY statement
        let createSql = `CREATE POLICY "${policyname}" ON "${schemaname}"."${tablename}"`;
        
        if (cmd && cmd !== 'ALL') {
          createSql += ` FOR ${cmd}`;
        }
        
        if (roles && roles.length > 0 && roles[0] !== 'public') {
          createSql += ` TO ${roles.join(', ')}`;
        }
        
        if (newQual) {
          createSql += ` USING (${newQual})`;
        }
        
        if (newWithCheck) {
          createSql += ` WITH CHECK (${newWithCheck})`;
        }
        
        createSql += ';';
        console.log(`Running: ${createSql}`);
        await client.query(createSql);
      }
      
      console.log("✅ All policies updated successfully!");
      await client.end();
      return true;
    } catch (err) {
      console.error(`Failed:`, err);
      return false;
    } finally {
      client.end().catch(()=>{}).then(()=>{});
    }
}

updatePolicies();
