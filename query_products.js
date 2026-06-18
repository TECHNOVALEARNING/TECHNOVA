import { createClient } from '@supabase/supabase-js';

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabase = createClient(url, serviceRoleKey);

async function check() {
  const { data: products, error: err } = await supabase.from('products').select('id, title, creator_id, is_published, category');
  if (err) console.error("Error:", err);
  else {
    console.log("PRODUCTS COUNT:", products.length);
    const byCreator = {};
    products.forEach(p => {
      byCreator[p.creator_id] = (byCreator[p.creator_id] || 0) + 1;
    });
    console.log("PRODUCTS BY CREATOR:", byCreator);
    console.log("SAMPLE PRODUCTS:", products.slice(0, 10));
  }
}

check();
