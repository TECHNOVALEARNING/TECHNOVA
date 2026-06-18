const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co/pg_meta/default/query';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

async function executeSql(sql) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + serviceRoleKey
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Success:', JSON.stringify(data, null, 2));
      return data;
    } else {
      const errorText = await res.text();
      console.log('❌ Error:', res.status, errorText);
      return null;
    }
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}

const query = process.argv[2] || `
  SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
  FROM pg_policies 
  WHERE qual LIKE '%isidoreagonan@gmail.com%' OR with_check LIKE '%isidoreagonan@gmail.com%';
`;

executeSql(query);
