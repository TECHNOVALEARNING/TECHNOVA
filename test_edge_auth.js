import { createClient } from '@supabase/supabase-js';

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabaseAdmin = createClient(url, serviceRoleKey);

async function run() {
  const email = 'test_admin_' + Math.random().toString(36).substring(7) + '@gmail.com';
  const password = 'TestPassword123!';
  
  console.log(`Creating test user: ${email}`);
  const { data: user, error: errC } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  if (errC) {
    console.error("Error creating user:", errC);
    return;
  }
  
  const userId = user.user.id;
  console.log(`Test user created with ID: ${userId}`);
  
  // Now login with client client
  const supabaseClient = createClient(url, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTk3MDgsImV4cCI6MjA5NjE5NTcwOH0.hvx7Xqt7q54VG5DEu9QtOqEbESbceRpeOMu_9ENVs7s'); // Using anon key from env
  const { data: session, error: errS } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
  
  if (errS) {
    console.error("Error signing in:", errS);
    return;
  }
  
  console.log("Signed in successfully. Fetching stats from admin-platform edge function...");
  const { data, error: errFunc } = await supabaseClient.functions.invoke('admin-platform', {
    body: { action: 'stats' }
  });
  
  if (errFunc) {
    console.error("Edge function returned error:", errFunc);
  } else {
    console.log("Edge function returned data:", data);
  }
  
  // Clean up
  console.log("Cleaning up test user...");
  await supabaseAdmin.auth.admin.deleteUser(userId);
}

run();
