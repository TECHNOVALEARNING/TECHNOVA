import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('stores').select('*').eq('slug', 'easy-tech').maybeSingle();
  if (error) {
    console.error('Error fetching store:', error);
  } else {
    console.log('Store data:', JSON.stringify(data, null, 2));
  }
}

run();
