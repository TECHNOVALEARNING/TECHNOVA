import { createClient } from '@supabase/supabase-js';

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabase = createClient(url, serviceRoleKey);
const adminUserId = '9702b3c5-4acf-42e2-828c-8bf2d50dfff8';

async function cleanup() {
  console.log("Listing all users...");
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (usersErr) {
    console.error("Error listing users:", usersErr);
    return;
  }

  const allUsers = usersData.users || [];
  const nonAdminUsers = allUsers.filter(u => u.id !== adminUserId);
  console.log(`Found ${nonAdminUsers.length} non-admin users to delete.`);

  for (const user of nonAdminUsers) {
    console.log(`Cleaning up data for user: ${user.email} (ID: ${user.id})...`);
    
    // Delete store visits
    await supabase.from('store_visits').delete().eq('store_owner_id', user.id);
    
    // Delete stores
    await supabase.from('stores').delete().eq('owner_id', user.id);

    // Delete custom domains
    await supabase.from('custom_domains').delete().eq('owner_id', user.id);

    // Delete badge eligibility scans
    await supabase.from('badge_eligibility_scans').delete().eq('user_id', user.id);

    // Delete badge subscriptions
    await supabase.from('badge_subscriptions').delete().eq('user_id', user.id);

    // Delete course modules and lessons for products created by this user
    const { data: products } = await supabase.from('products').select('id').eq('creator_id', user.id);
    if (products && products.length > 0) {
      const productIds = products.map(p => p.id);
      await supabase.from('course_lessons').delete().in('product_id', productIds);
      await supabase.from('course_modules').delete().in('product_id', productIds);
      await supabase.from('product_faqs').delete().in('product_id', productIds);
    }

    // Delete products
    await supabase.from('products').delete().eq('creator_id', user.id);

    // Delete automations
    await supabase.from('automations').delete().eq('creator_id', user.id);

    // Delete profiles
    await supabase.from('profiles').delete().eq('id', user.id);

    // Delete user from auth
    const { error: deleteAuthErr } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteAuthErr) {
      console.error(`Failed to delete user account ${user.email}:`, deleteAuthErr.message);
    } else {
      console.log(`Successfully deleted user account: ${user.email}`);
    }
  }

  console.log("Cleanup completed.");
}

cleanup();
