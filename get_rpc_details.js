const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

async function getRpcDetails() {
  try {
    const res = await fetch(url);
    const spec = await res.json();
    const rlsPath = spec.paths['/rpc/rls_auto_enable'];
    console.log(JSON.stringify(rlsPath, null, 2));
  } catch (err) {
    console.error(err);
  }
}

getRpcDetails();
