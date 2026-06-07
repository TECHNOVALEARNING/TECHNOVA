import fs from 'fs';

const supabaseUrl = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

async function test() {
  const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
}

test();
