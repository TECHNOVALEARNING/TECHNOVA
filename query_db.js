import { createClient } from '@supabase/supabase-js';

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabase = createClient(url, serviceRoleKey);

async function check() {
  const { data: users, error: errU } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (errU) console.error("Error listing users:", errU);
  else console.log("USERS:", users?.users?.map(u => ({ id: u.id, email: u.email })));
  
  const { data: stores, error: errS } = await supabase.from('stores').select('*');
  if (errS) console.error("Error listing stores:", errS);
  else console.log("STORES:", stores?.map(s => ({ id: s.id, name: s.name, slug: s.slug, owner_id: s.owner_id })));
  
  const { data: profiles, error: errP } = await supabase.from('profiles').select('*');
  if (errP) console.error("Error listing profiles:", errP);
  else console.log("PROFILES:", profiles?.map(p => ({ id: p.id, email: p.email, store_slug: p.store_slug })));
}

check();
