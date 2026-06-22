// Using native global fetch

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

async function listRpc() {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed to fetch OpenAPI spec:", res.status, await res.text());
      return;
    }
    const spec = await res.json();
    console.log("Exposed API Paths:");
    const paths = Object.keys(spec.paths || {});
    paths.forEach(p => {
      if (p.startsWith('/rpc/')) {
        console.log(`  RPC: ${p}`);
      } else {
        console.log(`  Table/View: ${p}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

listRpc();
