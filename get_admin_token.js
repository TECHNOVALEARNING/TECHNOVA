import { createClient } from '@supabase/supabase-js';

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabaseAdmin = createClient(url, serviceRoleKey);

async function testAdminAccess() {
  console.log("Generating magic link for ancres707@gmail.com...");
  const { data: linkData, error: errLink } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: 'ancres707@gmail.com',
    options: {
      redirectTo: 'http://localhost:8080/dashboard'
    }
  });

  if (errLink) {
    console.error("Error generating magic link:", errLink);
    return;
  }

  const actionLink = linkData.properties.action_link;
  console.log("Action link generated:", actionLink);

  console.log("Fetching action link to get the redirect URL...");
  const response = await fetch(actionLink, { redirect: 'manual' });
  const redirectUrl = response.headers.get('location');
  console.log("Redirect URL:", redirectUrl);

  if (!redirectUrl) {
    console.error("No redirect URL returned by magic link.");
    return;
  }

  // Parse token from hash in redirect URL
  const hash = redirectUrl.split('#')[1];
  if (!hash) {
    console.error("No hash fragment in redirect URL.");
    return;
  }

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  console.log("Access token extracted:", accessToken ? accessToken.substring(0, 30) + '...' : 'none');

  if (!accessToken) {
    console.error("Access token not found in URL params.");
    return;
  }

  // Invoke the edge function using this access token
  console.log("Invoking admin-platform edge function with admin token...");
  const resFunc = await fetch(`${url}/functions/v1/admin-platform`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ action: 'stats' })
  });

  console.log("Response status:", resFunc.status);
  const responseText = await resFunc.text();
  console.log("Response body:", responseText);
}

testAdminAccess();
